import { define as d, s, n, text, num } from "./define.ts";
function list(value: string) {
  if (!value.trim()) throw Error("Enter numbers separated by commas");
  const result = value.split(",").map((v) => (v.trim() ? Number(v) : NaN));
  if (!result.every(Number.isFinite) || result.length > 10000)
    throw Error("Invalid numbers or more than 10,000 items");
  return result;
}
function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}
const integer = {
  type: "integer",
  minimum: -Number.MAX_SAFE_INTEGER,
  maximum: Number.MAX_SAFE_INTEGER,
};
export const mathActions = [
  d(
    "math.statistics",
    "数列统计",
    "Descriptive statistics",
    "计算逗号分隔数列的总和、均值、中位数、总体方差。",
    "Math",
    { text: s },
    "object",
    { text: "1,2,3" },
    (i) => {
      const a = list(text(i)).sort((a, b) => a - b),
        sum = a.reduce((x, y) => x + y, 0),
        mean = sum / a.length;
      return {
        count: a.length,
        sum,
        mean,
        median:
          (a[Math.floor((a.length - 1) / 2)] + a[Math.floor(a.length / 2)]) / 2,
        min: a[0],
        max: a.at(-1)!,
        populationVariance:
          a.reduce((x, y) => x + (y - mean) ** 2, 0) / a.length,
      };
    },
  ),
  d(
    "math.gcd",
    "最大公约数",
    "Greatest common divisor",
    "欧几里得算法，要求安全整数。",
    "Math",
    { a: integer, b: integer },
    "number",
    { a: 48, b: 18 },
    (i) => gcd(num(i, "a"), num(i, "b")),
    6,
  ),
  d(
    "math.lcm",
    "最小公倍数",
    "Least common multiple",
    "计算两个安全整数的最小公倍数，溢出时报告错误。",
    "Math",
    { a: integer, b: integer },
    "number",
    { a: 12, b: 18 },
    (i) => {
      const a = num(i, "a"),
        b = num(i, "b");
      const v = a === 0 || b === 0 ? 0 : Math.abs((a / gcd(a, b)) * b);
      if (!Number.isSafeInteger(v)) throw Error("Integer overflow");
      return v;
    },
    36,
  ),
  d(
    "numbers.base.convert",
    "进制转换",
    "Integer base conversion",
    "转换 2–36 进制整数，使用 BigInt 保持精度。",
    "Numbers",
    {
      text: { ...s, maxLength: 10000 },
      from: { type: "integer", minimum: 2, maximum: 36 },
      to: { type: "integer", minimum: 2, maximum: 36 },
    },
    "string",
    { text: "ff", from: 16, to: 2 },
    (i) => {
      let v = text(i).trim().toLowerCase(),
        neg = false;
      if (v.startsWith("-")) {
        neg = true;
        v = v.slice(1);
      }
      if (!v) throw Error("Empty integer");
      let result = 0n;
      for (const c of v) {
        const digit = "0123456789abcdefghijklmnopqrstuvwxyz".indexOf(c);
        if (digit < 0 || digit >= num(i, "from"))
          throw Error("Invalid digit for base");
        result = result * BigInt(num(i, "from")) + BigInt(digit);
      }
      return (neg ? -result : result).toString(num(i, "to"));
    },
    "11111111",
  ),
  d(
    "math.quadratic",
    "一元二次方程",
    "Quadratic roots",
    "求实数域根，负判别式时给出说明。",
    "Math",
    { a: n, b: n, c: n },
    "object",
    { a: 1, b: -3, c: 2 },
    (i) => {
      const a = num(i, "a"),
        b = num(i, "b"),
        c = num(i, "c");
      if (a === 0) throw Error("a cannot be zero");
      const disc = b * b - 4 * a * c;
      if (disc < 0) return { discriminant: disc, realRoots: [] };
      const q = -0.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(disc));
      return {
        discriminant: disc,
        realRoots: q === 0 ? [0] : [q / a, c / q].sort((a, b) => a - b),
      };
    },
  ),
  d(
    "units.temperature",
    "温度换算",
    "Temperature conversion",
    "摄氏度转换为华氏度与开尔文，禁止低于绝对零度。",
    "Units",
    { celsius: { ...n, minimum: -273.15 } },
    "object",
    { celsius: 0 },
    (i) => ({
      celsius: num(i, "celsius"),
      fahrenheit: num(i, "celsius") * 1.8 + 32,
      kelvin: num(i, "celsius") + 273.15,
    }),
  ),
  d(
    "units.length",
    "长度换算",
    "Length conversion",
    "米换算为厘米、毫米、英寸、英尺和千米。",
    "Units",
    { meters: { ...n, minimum: 0 } },
    "object",
    { meters: 1 },
    (i) => {
      const v = num(i, "meters");
      return {
        meters: v,
        centimeters: v * 100,
        millimeters: v * 1000,
        inches: v / 0.0254,
        feet: v / 0.3048,
        kilometers: v / 1000,
      };
    },
  ),
  d(
    "units.bytes",
    "存储大小换算",
    "Storage conversion",
    "字节换算 SI 与 IEC 单位。",
    "Units",
    { bytes: { ...n, minimum: 0 } },
    "object",
    { bytes: 1024 },
    (i) => {
      const b = num(i, "bytes");
      return {
        bytes: b,
        kB: b / 1000,
        MB: b / 1e6,
        GB: b / 1e9,
        KiB: b / 1024,
        MiB: b / 1048576,
        GiB: b / 1073741824,
      };
    },
  ),
  d(
    "units.pressure",
    "压力换算",
    "Pressure conversion",
    "帕斯卡换算 bar、atm、psi。",
    "Units",
    { pascals: { ...n, minimum: 0 } },
    "object",
    { pascals: 101325 },
    (i) => ({
      pascals: num(i, "pascals"),
      bar: num(i, "pascals") / 1e5,
      atm: num(i, "pascals") / 101325,
      psi: num(i, "pascals") / 6894.757293168,
    }),
  ),
  d(
    "units.mass",
    "质量换算",
    "Mass conversion",
    "千克换算克、吨、磅和盎司。",
    "Units",
    { kilograms: { ...n, minimum: 0 } },
    "object",
    { kilograms: 1 },
    (i) => ({
      grams: num(i, "kilograms") * 1000,
      tonnes: num(i, "kilograms") / 1000,
      pounds: num(i, "kilograms") / 0.45359237,
      ounces: num(i, "kilograms") / 0.028349523125,
    }),
  ),
  d(
    "numbers.roman",
    "罗马数字",
    "Integer to Roman",
    "将 1–3999 整数转换为罗马数字。",
    "Numbers",
    { value: { type: "integer", minimum: 1, maximum: 3999 } },
    "string",
    { value: 2026 },
    (i) => {
      let v = num(i, "value"),
        out = "";
      for (const [n, t] of [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
      ] as [number, string][]) {
        while (v >= n) {
          out += t;
          v -= n;
        }
      }
      return out;
    },
    "MMXXVI",
  ),
  d(
    "numbers.percent",
    "百分比变化",
    "Percentage change",
    "计算初值到终值的百分比变化，初值不能为零。",
    "Numbers",
    { initial: n, final: n },
    "number",
    { initial: 100, final: 125 },
    (i) => {
      if (num(i, "initial") === 0) throw Error("Initial value cannot be zero");
      return (
        ((num(i, "final") - num(i, "initial")) / Math.abs(num(i, "initial"))) *
        100
      );
    },
    25,
  ),
];
