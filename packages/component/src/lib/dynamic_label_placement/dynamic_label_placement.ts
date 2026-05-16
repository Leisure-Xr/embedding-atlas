// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

// 该算法基于以下论文：
// Been, Ken, Eli Daiches, and Chee Yap. "Dynamic Map Labeling." IEEE Transactions on Visualization and Computer Graphics 12, no. 5 (2006): 773–80. https://doi.org/10.1109/TVCG.2006.136.

import type { Point, Rectangle } from "../utils.js";
import { PriorityQueue } from "./priority_queue.js";

/** 用于放置计算的标签描述。 */
export interface Label {
  /** scale = 1 时的标签边界。 */
  bounds: Rectangle;
  /** scale = 0 时的标签位置。通常可以设为 `bounds` 的中心。 */
  locationAtZero: Point;
  /** 该标签可出现的最小 scale。 */
  minScale?: number;
  /** 该标签可出现的最大 scale。 */
  maxScale?: number;
  /** 标签优先级。 */
  priority?: number;
}

/** 标签放置结果。 */
export interface Placement {
  /** 最小 scale。 */
  minScale: number;
  /** 最大 scale。 */
  maxScale: number;
}

export interface Options {
  /** 所有标签共用的全局最大 scale。 */
  globalMaxScale: number;
}

export function dynamicLabelPlacement(labels: Label[], options: Partial<Options> = {}): (Placement | null)[] {
  let globalMaxScale = options.globalMaxScale ?? 1;
  let n = labels.length;

  let edgeLists: [number, number][][] = [];
  for (let i = 0; i < n; i++) {
    edgeLists.push([]);
  }
  let allLevels = new Set<number>();
  allLevels.add(0);
  // 为每对标签计算它们刚好接触的 scale（重叠与不重叠之间的转折点）。
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let { x: xi, y: yi } = labels[i].locationAtZero;
      let { x: xj, y: yj } = labels[j].locationAtZero;
      let bi = labels[i].bounds;
      let bj = labels[j].bounds;
      let k1 = xi < xj ? (xi - xj) / (bj.xMin - bi.xMax + xi - xj) : (xi - xj) / (bj.xMax - bi.xMin + xi - xj);
      let k2 = yi < yj ? (yi - yj) / (bj.yMin - bi.yMax + yi - yj) : (yi - yj) / (bj.yMax - bi.yMin + yi - yj);
      let scale = Math.max(k1, k2);
      if (xi == xj && yi == yj) {
        if (bi.xMin < bj.xMax && bi.xMax > bj.xMin && bi.yMin < bj.yMax && bi.yMax > bj.yMin) {
          scale = 0;
        } else {
          scale = Infinity;
        }
      } else if (scale <= 0) {
        scale = Infinity;
      } else {
        // 离散化 scale 层级，避免层级过多。
        scale = Math.exp(Math.floor(Math.log(scale) * 100) / 100);
      }
      edgeLists[i].push([j, scale]);
      edgeLists[j].push([i, scale]);
      allLevels.add(scale);
    }
  }
  let offsets: number[] = [];
  let ranges: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    edgeLists[i].sort((a, b) => a[1] - b[1]);
    offsets.push(edgeLists[i].length - 1);
    let range: [number, number] = [
      Math.min(globalMaxScale, labels[i].minScale ?? 0),
      Math.min(globalMaxScale, labels[i].maxScale ?? globalMaxScale),
    ];
    ranges.push(range);
    allLevels.add(range[0]);
    allLevels.add(range[1]);
  }
  let placements: (Placement | null)[] = labels.map(() => null);
  let sortedLevels = Array.from(allLevels).sort((a, b) => b - a);

  let queue = new PriorityQueue();
  let numConflicts: Set<number>[] = [];
  for (let i = 0; i < n; i++) {
    numConflicts.push(new Set());
  }
  let inQueue = new Set<number>();
  let isVisible = new Set<number>();

  for (let level of sortedLevels) {
    for (let i = 0; i < n; i++) {
      while (offsets[i] >= 0 && edgeLists[i][offsets[i]][1] >= level) {
        let j = edgeLists[i][offsets[i]][0];
        numConflicts[i].delete(j);
        offsets[i] -= 1;
      }
    }
    for (let i = 0; i < n; i++) {
      if (ranges[i][0] < level && level <= ranges[i][1] && numConflicts[i].size == 0 && !inQueue.has(i)) {
        inQueue.add(i);
        queue.insert(i, labels[i].priority ?? 0);
      }
      if (isVisible.has(i) && placements[i]!.minScale >= level) {
        isVisible.delete(i);
        for (let j = 0; j < n; j++) {
          numConflicts[j].delete(i);
        }
      }
    }
    while (true) {
      let i = queue.popMax();
      if (i == null) {
        break;
      }
      placements[i] = { minScale: ranges[i][0], maxScale: level };
      isVisible.add(i);
      for (let c = 0; c <= offsets[i]; c++) {
        let j = edgeLists[i][c][0];
        numConflicts[j].add(i);
        if (inQueue.has(j)) {
          queue.delete(j);
          inQueue.delete(j);
        }
      }
    }
  }
  return placements;
}
