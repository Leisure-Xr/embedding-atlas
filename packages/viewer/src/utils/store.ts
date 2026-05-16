// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import { type Writable } from "svelte/store";

/**
 * 包装现有 Svelte writable store，并返回一个在通知订阅者时会忽略自身更新的新 store。
 *
 * 当通过此包装器的 `set` 或 `update` 方法更新被包装 store 时，
 * 返回 store 的订阅者**不会被调用**。
 * 直接更新原始 store 仍会通知订阅者。
 *
 * 当组件既写入又订阅同一个 store，并希望避免自身写入再次触发回调时，此函数很有用。
 */
export function isolatedWritable<T>(wrapped: Writable<T>): Writable<T> {
  let counter = 0;
  function withGate(perform: () => void) {
    counter += 1;
    try {
      perform();
    } finally {
      counter -= 1;
    }
  }
  return {
    set(value: T) {
      withGate(() => {
        wrapped.set(value);
      });
    },
    update(updater: (value: T) => T) {
      withGate(() => {
        wrapped.update(updater);
      });
    },
    subscribe(run: (value: T) => void) {
      return wrapped.subscribe((value) => {
        if (counter == 0) {
          run(value);
        }
      });
    },
  };
}
