// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export class OccupancyMap {
  private numColumns: number;
  private rows: Uint32Array;

  constructor(numColumns: number) {
    if (numColumns > 32) {
      throw new Error("numColumns 必须小于等于 32");
    }
    this.numColumns = numColumns;
    this.rows = new Uint32Array(128);
  }

  private ensureSize(count: number) {
    if (this.rows.length < count) {
      let newLength = Math.ceil(this.rows.length * 1.5);
      while (newLength < count) newLength = Math.ceil(newLength * 1.5);
      let newRows = new Uint32Array(newLength);
      newRows.set(this.rows, 0);
      this.rows = newRows;
    }
  }

  clone(): OccupancyMap {
    let r = new OccupancyMap(this.numColumns);
    r.rows = new Uint32Array(this.rows);
    return r;
  }

  /** 获取 (x, y) 位置的位。 */
  get(x: number, y: number): boolean {
    if (x < 0 || x >= this.numColumns || y < 0 || y >= this.rows.length) {
      return false;
    }
    return (this.rows[y] & (1 << x)) != 0;
  }

  /** 设置 (x, y) 位置的位。 */
  set(x: number, y: number, value: number) {
    if (x < 0 || x >= this.numColumns || y < 0) {
      return;
    }
    this.ensureSize(y + 1);
    if (value == 0) {
      this.rows[y] &= ~(1 << x);
    } else if (value == 1) {
      this.rows[y] |= 1 << x;
    }
  }

  /** 检查给定矩形是否可用；如果任意位已被占用则返回 false。 */
  check(x: number, y: number, width: number, height: number): boolean {
    if (x < 0) {
      width += x;
      x = 0;
    }
    if (y < 0) {
      height += y;
      y = 0;
    }
    if (x + width > this.numColumns) {
      width = this.numColumns - x;
    }
    if (width <= 0 || height <= 0) {
      return true;
    }
    let mask = ((1 << width) - 1) << x;
    for (let dy = 0; dy < height; dy++) {
      if (y + dy < this.rows.length && (this.rows[y + dy] & mask) != 0) {
        return false;
      }
    }
    return true;
  }

  /** 将给定矩形填充为已占用。 */
  fill(x: number, y: number, width: number, height: number) {
    if (x < 0) {
      width += x;
      x = 0;
    }
    if (y < 0) {
      height += y;
      y = 0;
    }
    if (x + width > this.numColumns) {
      width = this.numColumns - x;
    }
    if (width <= 0 || height <= 0) {
      return;
    }
    const mask = ((1 << width) - 1) << x;
    this.ensureSize(y + height);
    for (let dy = 0; dy < height; dy++) {
      this.rows[y + dy] |= mask;
    }
  }

  /** 查找可放置尺寸为 (width, height) 的矩形的起始位置 (x, y)。 */
  find(width: number, height: number): { x: number; y: number } {
    if (width <= 0 || height <= 0 || width > this.numColumns) {
      throw new Error("尺寸无效");
    }
    let maxY = this.rows.length;
    for (let y = 0; y < maxY; y++) {
      for (let x = 0; x <= this.numColumns - width; x++) {
        if (this.check(x, y, width, height)) {
          return { x, y };
        }
      }
    }
    let newY = this.rows.length;
    return { x: 0, y: newY };
  }

  maxOccupiedY(): number {
    for (let i = this.rows.length - 1; i >= 0; i--) {
      if (this.rows[i] != 0) {
        return i;
      }
    }
    return -1;
  }

  /** 返回符合给定尺寸约束的未使用矩形。 */
  unusedRects(
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { x: number; y: number; width: number; height: number }[] {
    let map = this.clone();
    let result: { x: number; y: number; width: number; height: number }[] = [];
    let maxY = this.maxOccupiedY();
    // 查找所有符合尺寸约束的未使用矩形区域。
    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x < map.numColumns; x++) {
        // 如果此位置已被占用，则跳过。
        if (map.get(x, y)) {
          continue;
        }
        // 查找从 (x, y) 开始的矩形的最大宽度和高度。
        let maxW = 0;
        for (let w = 1; w <= Math.min(maxWidth, map.numColumns - x) && !map.get(x + w - 1, y); w++) {
          maxW = w;
        }

        // 如果无法满足最小宽度，则跳过。
        if (maxW < minWidth) {
          continue;
        }

        let maxH = 0;

        // 为每个可能宽度查找最大高度。
        for (let w = maxW; w >= minWidth; w--) {
          maxH = 0;
          for (let h = 1; h <= Math.min(maxHeight, map.rows.length - y); h++) {
            // 检查整段行区域是否空闲。
            let rowFree = true;
            for (let dx = 0; dx < w; dx++) {
              if (map.get(x + dx, y + h - 1)) {
                rowFree = false;
                break;
              }
            }
            if (!rowFree) {
              break;
            }
            maxH = h;
          }

          if (y + maxH > maxY + 1) {
            maxH = maxY + 1 - y;
          }

          // 如果找到了有效矩形，则加入结果并将该区域标为已使用。
          if (maxH >= minHeight) {
            result.push({ x, y, width: w, height: maxH });

            // 在工作 map 中将此矩形标为已占用。
            map.fill(x, y, w, maxH);
            break; // 此区域已使用，移动到下一个位置。
          }
        }
      }
    }

    return result;
  }
}
