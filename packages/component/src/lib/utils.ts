// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

/** 带 x、y 坐标的点。 */
export interface Point {
  x: number;
  y: number;
}

/** 每个维度都有最小/最大坐标的矩形。
 * 要求 xMin <= xMax 且 yMin <= yMax。 */
export interface Rectangle {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

/** 描述 viewport 平移和缩放状态的状态。
 * 点的屏幕坐标按以下方式计算：
 * px = ((x - viewport.x) * viewport.scale + 1) / 2 * width
 * py = ((y - viewport.y) * viewport.scale + 1) / 2 * height
 */
export interface ViewportState {
  /** viewport 中心的 x 坐标，以数据单位表示。 */
  x: number;
  /** viewport 中心的 y 坐标，以数据单位表示。 */
  y: number;
  /** viewport 的 scale。它会将数据单位缩放到 [-1, 1]。 */
  scale: number;
}

/** 节流给定的 async tooltip 函数，确保同一时间只有一个调用在运行。
 * 如果期间提供了更多输入，只会运行最后一个输入。
 * 同时，如果 tooltip 最近没有显示过，会在 delayMS 后显示。
 */
export function throttleTooltip<T, U>(func: (input: T) => Promise<U>, isVisible: () => boolean): (input: T) => void {
  let running = false;
  let next: T | undefined = undefined;
  let lastVisible: number | undefined = undefined;
  let timeout: any | undefined = undefined;

  let delayMS = 300;
  let recentThresholdMS = 300;

  let run = async (input: T) => {
    running = true;
    try {
      await func(input);
    } catch (e) {
      console.error(e);
    }
    running = false;
    if (next !== undefined) {
      let v = next;
      next = undefined;
      perform(v);
    }
  };

  let perform = async (input: T) => {
    if (running) {
      next = input;
      return;
    }
    let now = new Date().getTime();
    if (isVisible()) {
      lastVisible = now;
    }
    let shouldDelay = true;
    if (lastVisible == undefined || now - lastVisible < recentThresholdMS) {
      shouldDelay = false;
    }
    if (shouldDelay) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => run(input), delayMS);
    } else {
      run(input);
    }
  };
  return perform;
}

/** 返回由 [x, y] 点数组定义的分段线性函数值。
 * 在已定义值范围外，该函数应保持常量。
 * 例如，如果点为 [[0, 1], [2, 5], [3, -1]]，则有：
 * f(0) = 1, f(1) = 3, f(-1) = 1, f(4) = -1.
 * 点应按 x 坐标升序排序。
 * 如果没有提供点，函数返回 0。
 */
export function piecewiseLinear(x: number, ...points: [number, number][]): number {
  if (points.length == 0) {
    return 0;
  }
  if (x <= points[0][0]) {
    return points[0][1];
  }
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i][0] && x <= points[i + 1][0]) {
      let p1 = points[i][0];
      let v1 = points[i][1];
      let p2 = points[i + 1][0];
      let v2 = points[i + 1][1];
      return ((x - p1) / (p2 - p1)) * (v2 - v1) + v1;
    }
  }
  return points[points.length - 1][1];
}

export function pointDistance(p1: Point, p2: Point): number {
  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function polygonToPath(polygon: Point[]): string {
  let points = polygon.map(({ x, y }) => `${x},${y}`);
  return "M " + points.join(" L ") + " Z";
}

export function boundingRect(points: Point[]): Rectangle {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let { x, y } of points) {
    xMin = Math.min(xMin, x);
    yMin = Math.min(yMin, y);
    xMax = Math.max(xMax, x);
    yMax = Math.max(yMax, y);
  }
  return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };
}

/** Download the array buffer. */
export function downloadBuffer(arrayBuffer: ArrayBuffer, fileName: string = "arraybuffer.bin") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([arrayBuffer], { type: "application/octet-stream" }));
  a.download = fileName;
  a.click();
}

export async function cacheKeyForObject(object: any): Promise<string> {
  let json = JSON.stringify(object);
  return simpleStringHash(json);
}

export function deepEquals(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }
  // If either of them is null or not an object, they are not equal
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
    return false;
  }
  // If the objects/arrays have a different number of keys, they are not equal
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (let key in a) {
    if (b.hasOwnProperty(key)) {
      if (!deepEquals(a[key], b[key])) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/** cyrb53 (c) 2018 bryc (github.com/bryc)
 * License: Public domain (or MIT if needed). Attribution appreciated.
 *
 * A fast and simple 53-bit string hash function with decent collision resistance.
 * Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
 *
 * @param data The input data as a Uint8Array.
 * @param seed An optional seed value.
 * @returns A 64-bit hash value as two 32-bit numbers.
 */
function cyrb64(data: Uint8Array, seed: number = 0): [number, number] {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < data.length; i++) {
    let ch = data[i];
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h2 >>> 0, h1 >>> 0];
}

/** Returns a short non-secure hash for a string */
function simpleStringHash(str: string): string {
  let encoder = new TextEncoder();
  let data = encoder.encode(str);
  let hash = cyrb64(data);
  return hash[0].toString(16).padStart(8, "0") + hash[1].toString(16).padStart(8, "0");
}
