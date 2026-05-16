// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import * as d3 from "d3";

import { inferNumberFormatter } from "./formatter.js";

export interface ContinuousTicksOptions {
  /** 比例尺类型。 */
  type: "linear" | "log" | "symlog" | "time";

  /** Symlog 常量。 */
  constant?: number;

  /** 数据定义域最小值。 */
  dataMin: number;

  /** 数据定义域最大值。 */
  dataMax: number;

  /** 是否将比例尺定义域扩展到刻度的最小/最大值（为 true 时可能输出数据定义域外的刻度）。 */
  extendDomainToTicks?: boolean;

  /** 期望的刻度数量。 */
  desiredCount?: number;

  /** 预先指定的刻度值；如果指定，则直接使用这些值作为刻度，但仍会推断格式化器。 */
  values?: number[];

  /**
   * 对于 "time" 比例尺类型，值是否包含时区信息（默认 false）。
   * 如果为 true，则将值视为真正的 UTC 时间戳（epoch 以来的毫秒数），并使用当前时区显示。
   * 如果为 false，则将值视为未知时区的时间戳，以 UTC 显示但不包含任何时区信息。
   */
  hasTimezone?: boolean;
}

export interface ContinuousTicksResult {
  /** 扩展后的定义域最小值。 */
  domainMin: number;

  /** 扩展后的定义域最大值。 */
  domainMax: number;

  /** 刻度值。 */
  values: number[];

  /** 格式化刻度的函数。 */
  format: (value: number) => string;

  /**
   * 返回刻度层级的函数（0 为基础层级，1 为更低层级，依此类推）。
   * 当前层级 0 有网格线和标签，层级 1 仅有网格线。
   */
  level: (value: number) => number;
}

export function continuousTicks(options: ContinuousTicksOptions): ContinuousTicksResult {
  // 对时间类型做特殊处理。
  if (options.type == "time") {
    return timeTicks(options);
  }

  let desiredCount = options.desiredCount ?? 5;

  let scale: d3.ScaleContinuousNumeric<number, number>;

  // 数值类型。
  switch (options.type) {
    case "linear": {
      scale = d3.scaleLinear().domain([options.dataMin, options.dataMax]);
      break;
    }
    case "log": {
      scale = d3.scaleLog().domain([options.dataMin, options.dataMax]);
      break;
    }
    case "symlog": {
      let constant = options.constant ?? 1;
      scale = d3.scaleSymlog().constant(constant).domain([options.dataMin, options.dataMax]);
      scale.nice = () => scale;
      scale.ticks = (count) => symlogTicks(scale.domain(), constant, count);
      scale.tickFormat = () => d3.format("~s");
      break;
    }
    default: {
      throw new Error("比例尺类型无效");
    }
  }

  let values: number[] = [];
  if (options.extendDomainToTicks ?? true) {
    if (options.values) {
      values = options.values;
      let all = scale.domain().concat(values);
      scale = scale.domain([
        all.reduce((a, b) => Math.min(a, b), all[0]),
        all.reduce((a, b) => Math.max(a, b), all[0]),
      ]);
    } else {
      if (scale.nice) {
        scale = scale.nice(desiredCount);
      }
      values = scale.ticks(desiredCount);
    }
  } else {
    values = options.values ?? scale.ticks(desiredCount);
    let [dmin, dmax] = scale.domain();
    values = values.filter((x) => x >= dmin && x <= dmax);
  }

  // let format = scale.tickFormat(options.values ? options.values.length : desiredCount);
  let format = inferNumberFormatter(values);
  let level = (x: number) => {
    if (options.type == "log" || options.type == "symlog") {
      return Math.round(Math.log10(Math.abs(x))) == Math.log10(Math.abs(x)) ? 0 : 1;
    } else {
      return 0;
    }
  };
  return {
    domainMin: scale.domain()[0],
    domainMax: scale.domain()[1],
    values,
    format,
    level,
  };
}

function timeTicks(options: ContinuousTicksOptions): ContinuousTicksResult {
  let desiredCount = options.desiredCount ?? 5;

  let scale = (options.hasTimezone ? d3.scaleTime() : d3.scaleUtc()).domain([options.dataMin, options.dataMax]);

  let values: number[] = [];

  if (options.extendDomainToTicks ?? true) {
    if (options.values) {
      values = options.values;
      let all = scale
        .domain()
        .map((x) => x.getTime())
        .concat(values);
      scale = scale.domain([
        all.reduce((a, b) => Math.min(a, b), all[0]),
        all.reduce((a, b) => Math.max(a, b), all[0]),
      ]);
    } else {
      if (scale.nice) {
        scale = scale.nice(desiredCount);
      }
      values = scale.ticks(desiredCount).map((x) => x.getTime());
    }
  } else {
    values = options.values ?? scale.ticks(desiredCount).map((x) => x.getTime());
    let [dmin, dmax] = scale.domain().map((x) => x.getTime());
    values = values.filter((x) => x >= dmin && x <= dmax);
  }

  let timeFormat = scale.tickFormat(options.values ? options.values.length : desiredCount);
  let format = (v: number) => timeFormat(new Date(v));

  return {
    domainMin: scale.domain()[0].getTime(),
    domainMax: scale.domain()[1].getTime(),
    values,
    format,
    level: () => 0,
  };
}

function symlogTicks(domain: number[], constant: number, count?: number | undefined): number[] {
  count = count ?? 5;

  let min = domain[0];
  let max = domain[1];

  if ((min > 0 && max > 0 && min / max > 0.5) || (min < 0 && max < 0 && max / min > 0.5)) {
    return d3.scaleLinear().domain([min, max]).ticks(count);
  }

  let start = constant * 2;
  let threshold = constant * 5;
  if (min < -threshold && max > threshold) {
    count = Math.ceil(count / 2);
  }
  return [
    ...(min < -threshold
      ? d3
          .scaleLog()
          .domain([start, -min])
          .ticks(count)
          .map((x) => -x)
      : []),
    0,
    ...(max > threshold ? d3.scaleLog().domain([start, max]).ticks(count) : []),
  ].filter((x) => x >= min && x <= max);
}
