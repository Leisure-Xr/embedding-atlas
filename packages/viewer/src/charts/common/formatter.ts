// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

import * as d3 from "d3";

/**
 * 为一组值推断数字格式化器。
 * - 如果所有值都是整数，则用整数形式显示（使用 toLocaleString），不显示小数点。
 * - 对于浮点值，找到合理精度，并以一致格式显示所有值。
 */
export function inferNumberFormatter(values: number[]): (value: number) => string {
  let locale = undefined; // 使用默认 locale。

  let finite = values.filter((v) => Number.isFinite(v));

  if (finite.length === 0) {
    return (value: number) => value.toLocaleString(locale);
  }

  let allInteger = finite.every((v) => Number.isInteger(v));

  let maxAbs = d3.max(finite, (v) => Math.abs(v)) ?? 0;

  if (allInteger && maxAbs < 1e15) {
    // 对合理范围内的整数使用 locale 分组（例如 1,234,567）。
    return (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 0 });
  }

  // 确定合理的小数位数。
  let minAbs = d3.min(finite.filter((v) => v !== 0).map((v) => Math.abs(v))) ?? Infinity;

  // 对非常大或非常小的数字使用科学计数法。
  if (maxAbs >= 1e9 || (minAbs > 0 && minAbs < 1e-3)) {
    return d3.format(".3~e");
  }

  // 找到可区分这些值的精度。
  // 使用范围（如果范围为零，则使用最大绝对值）确定小数位数。
  let range = (d3.max(finite) ?? 0) - (d3.min(finite) ?? 0);
  let ref = range > 0 ? range : maxAbs;

  // 参考量级中的整数位数。
  let intDigits = ref >= 1 ? Math.floor(Math.log10(ref)) + 1 : 0;

  // 总体目标约为 4 位有效数字，浮点数至少保留 1 位小数。
  let sigFigs = Math.max(4, intDigits + 1);
  let decimals = Math.max(1, sigFigs - intDigits);
  // 限制在合理范围内。
  decimals = Math.min(decimals, 6);

  // 如果用更少小数位时这些值已经足够“干净”，则减少位数。
  // 检查所有值是否能用更少小数位往返表示。
  for (let d = 1; d < decimals; d++) {
    let factor = 10 ** d;
    if (finite.every((v) => Math.abs(v - Math.round(v * factor) / factor) < 1e-12)) {
      decimals = d;
      break;
    }
  }

  return (value: number) =>
    value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * 推断时间格式化器。输入为 epoch 以来的毫秒数。如果 `hasTimezone` 为 true，则使用本地时间，否则使用 UTC 时间。
 * 推断格式的目标是让这些值以简洁形式表示。
 * 例如，如果所有值都舍入到年份（如 2020-01-01 00:00:00），
 * 则输出只显示年份的格式化器。
 * 如果所有值都舍入到天、月等单位，则分别格式化到对应单位。
 */
export function inferTimeFormatter(values: number[], hasTimezone: boolean = false): (value: number) => string {
  if (values.length === 0) {
    let fmt = hasTimezone ? d3.timeFormat : d3.utcFormat;
    let formatter = fmt("%Y-%m-%d %H:%M:%S");
    return (value: number) => formatter(new Date(value));
  }

  // hasTimezone 为 true 时，通过 Date 方法使用本地时间；否则使用 UTC 方法。
  let tzOffsetMs = hasTimezone ? -new Date().getTimezoneOffset() * 60_000 : 0;
  let adjusted = (ms: number) => new Date(ms + tzOffsetMs);

  let getYear = (ms: number) => adjusted(ms).getUTCFullYear();
  let getMonth = (ms: number) => adjusted(ms).getUTCMonth();
  let getDay = (ms: number) => adjusted(ms).getUTCDate();
  let getHour = (ms: number) => adjusted(ms).getUTCHours();
  let getMinute = (ms: number) => adjusted(ms).getUTCMinutes();
  let getSecond = (ms: number) => adjusted(ms).getUTCSeconds();
  let getMs = (ms: number) => adjusted(ms).getUTCMilliseconds();

  // 确定所需的最细粒度。
  let hasSubSecond = values.some((v) => getMs(v) !== 0);
  let hasSeconds = hasSubSecond || values.some((v) => getSecond(v) !== 0);
  let hasMinutes = hasSeconds || values.some((v) => getMinute(v) !== 0);
  let hasHours = hasMinutes || values.some((v) => getHour(v) !== 0);
  let hasDays = hasHours || values.some((v) => getDay(v) !== 1);
  let hasMonths = hasDays || values.some((v) => getMonth(v) !== 0);

  // 检查所有值是否同一年（用于更紧凑的格式）。
  let allSameYear = values.every((v) => getYear(v) === getYear(values[0]));

  // 选择最简洁的格式说明符。
  let specifier: string;
  if (!hasMonths) {
    specifier = "%Y";
  } else if (!hasDays) {
    specifier = "%b %Y";
  } else if (!hasHours) {
    specifier = allSameYear ? "%b %-d" : "%Y-%m-%d";
  } else if (!hasSeconds) {
    specifier = allSameYear ? "%b %-d %H:%M" : "%Y-%m-%d %H:%M";
  } else if (!hasSubSecond) {
    specifier = allSameYear ? "%b %-d %H:%M:%S" : "%Y-%m-%d %H:%M:%S";
  } else {
    specifier = allSameYear ? "%b %-d %H:%M:%S.%L" : "%Y-%m-%d %H:%M:%S.%L";
  }

  let fmt = hasTimezone ? d3.timeFormat : d3.utcFormat;
  let formatter = fmt(specifier);
  return (value: number) => formatter(new Date(value));
}
