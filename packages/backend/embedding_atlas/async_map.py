import asyncio
import random
from typing import Awaitable, Callable, TypeVar

from tqdm.auto import tqdm

from .utils import logger


class _BackoffState:
    def __init__(self, base_delay: float, max_delay: float):
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.current_delay = 0.0
        self.consecutive_errors = 0

    def on_error(self):
        self.consecutive_errors += 1
        self.current_delay = min(
            self.max_delay, self.base_delay * (2 ** (self.consecutive_errors - 1))
        )

    def on_success(self):
        self.consecutive_errors = 0
        self.current_delay = 0.0


T = TypeVar("T")
R = TypeVar("R")


async def async_map(
    inputs: list[T],
    func: Callable[[T], Awaitable[R]],
    *,
    concurrency: int = 4,
    max_retry: int = 0,
    retry_base_delay: float = 1.0,
    retry_max_delay: float = 30.0,
    description: str = "任务",
    fallback: R | None = None,
) -> list[R]:
    """
    使用 async 函数映射输入，并返回按原顺序排列的结果列表。

    Args:
        inputs: 要处理的条目列表。
        func: 应用于每个条目的 async 函数。
        concurrency: 最大并发调用数。
        max_retry: 失败后的最大重试次数（0 表示不重试）。
        retry_base_delay: 指数退避的基础延迟秒数（默认 1.0）。
        retry_max_delay: 退避延迟上限秒数（默认 30.0）。
        description: 进度条描述。
        fallback: 出错时填入的结果。若为 None，则抛出错误。
                  当 fallback 为 None 且发生错误时，会立即停止处理新任务。
    """
    count = len(inputs)
    results: list[R | None] = [None] * count
    semaphore = asyncio.Semaphore(concurrency)
    backoff = _BackoffState(retry_base_delay, retry_max_delay)
    # 用于通知处理应停止的事件（fallback 为 None 且发生错误时使用）。
    stop_event = asyncio.Event()
    # fallback 为 None 时保存遇到的第一个错误。
    first_error: list[Exception | None] = [None]

    pbar = tqdm(total=count, desc=description)

    async def process(index: int, item: T) -> None:
        async with semaphore:
            last_error: Exception | None = None
            for attempt in range(max_retry + 1):
                # 每次重试前检查是否应停止。
                if stop_event.is_set():
                    return

                try:
                    # 所有任务共享同一个 backoff。
                    if backoff.current_delay > 0:
                        delay = random.uniform(0, backoff.current_delay)
                        logger.warning(
                            f"Backoff：等待 {delay:.1f}s 后再对第 {index} 项进行第 {attempt + 1} 次尝试"
                        )
                        await asyncio.sleep(delay)
                    results[index] = await func(item)
                    backoff.on_success()
                    pbar.update(1)
                    return
                except Exception as e:
                    logger.error(e)
                    backoff.on_error()
                    last_error = e
                    if attempt < max_retry:
                        continue
            if last_error is not None:
                if fallback is None:
                    # 通知其他任务停止并保存错误。
                    if first_error[0] is None:
                        first_error[0] = last_error
                    stop_event.set()
                else:
                    results[index] = fallback
                    pbar.update(1)

    await asyncio.gather(*(process(i, item) for i, item in enumerate(inputs)))

    pbar.close()

    # 如果因错误停止，则抛出该错误。
    if first_error[0] is not None:
        raise first_error[0]

    return results  # type: ignore[return-value]
