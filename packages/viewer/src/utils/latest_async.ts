// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

/**
 * 包装异步函数，使只有最新一次调用的结果会传给 onResult。
 * 更早的待处理结果会被忽略，错误也会被忽略。
 */
export function latestAsync<Args extends any[], R>(
  asyncFn: (...args: Args) => Promise<R>,
  onResult: (result: R) => void,
): (...args: Args) => void {
  let latestId = 0;
  return (...args: Args) => {
    const id = ++latestId;
    asyncFn(...args)
      .then((result) => {
        if (id === latestId) {
          onResult(result);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
}
