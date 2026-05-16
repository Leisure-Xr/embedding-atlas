// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

/**
 * 按给定顺序对项目排序。如果项目不在给定顺序中，则按出现顺序排序。
 * 指定了顺序的项目应排在未指定顺序的项目之前。
 */
export function reorder(items: string[], order?: string[] | undefined): string[] {
  if (!order || order.length === 0) {
    return items;
  }
  let itemsSet = new Set(items);
  let orderSet = new Set(order);
  return [...order.filter((x) => itemsSet.has(x)), ...items.filter((x) => !orderSet.has(x))];
}
