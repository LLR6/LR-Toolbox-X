import { define as d, s, n, text, num } from "./define.ts";
export function matrix(value: string): number[][] {
  const v: unknown = JSON.parse(value);
  if (
    !Array.isArray(v) ||
    !v.length ||
    v.length > 10 ||
    !Array.isArray(v[0]) ||
    !v[0].length ||
    v[0].length > 10 ||
    v.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== v[0].length ||
        row.some((x) => typeof x !== "number" || !Number.isFinite(x)),
    )
  )
    throw Error(
      "Expected a rectangular finite numeric matrix, 1–10 rows and columns",
    );
  return v;
}
function square(v: number[][]) {
  if (v.length !== v[0].length) throw Error("Expected a square matrix");
}
function elimination(a: number[][], extra: number[][]) {
  square(a);
  const v = a.map((r, i) => [...r, ...(extra[i] ?? [])]),
    size = a.length;
  let determinant = 1;
  for (let col = 0; col < size; col++) {
    let pivot = col;
    for (let j = col + 1; j < size; j++)
      if (Math.abs(v[j][col]) > Math.abs(v[pivot][col])) pivot = j;
    if (v[pivot][col] === 0) return { determinant: 0, result: [] };
    if (pivot !== col) {
      [v[pivot], v[col]] = [v[col], v[pivot]];
      determinant *= -1;
    }
    const p = v[col][col];
    determinant *= p;
    for (let j = col; j < v[col].length; j++) v[col][j] /= p;
    for (let row = 0; row < size; row++) {
      if (row === col) continue;
      const factor = v[row][col];
      for (let j = col; j < v[row].length; j++) v[row][j] -= factor * v[col][j];
    }
  }
  return { determinant, result: v.map((r) => r.slice(size)) };
}
function integer(v: number, min: number, max: number) {
  if (!Number.isSafeInteger(v) || v < min || v > max)
    throw Error(`Expected an integer from ${min} to ${max}`);
  return v;
}
function big(value: string) {
  if (!/^-?\d{1,500}$/.test(value))
    throw Error("Expected an integer with up to 500 digits");
  return BigInt(value);
}
export const advancedMathActions = [
  d(
    "math.matrix.transpose",
    "矩阵转置",
    "Transpose matrix",
    "交换 JSON 数值矩阵的行列，最大 10 × 10。",
    "Math",
    { text: s },
    "object",
    { text: "[[1,2,3],[4,5,6]]" },
    (i) => {
      const v = matrix(text(i));
      return { matrix: v[0].map((_, j) => v.map((r) => r[j])) };
    },
    {
      matrix: [
        [1, 4],
        [2, 5],
        [3, 6],
      ],
    },
  ),
  d(
    "math.matrix.multiply",
    "矩阵乘法",
    "Multiply matrices",
    "计算两个 JSON 数值矩阵的乘积，最大 10 × 10。",
    "Math",
    { a: s, b: s },
    "object",
    { a: "[[1,2],[3,4]]", b: "[[5],[6]]" },
    (i) => {
      const a = matrix(text(i, "a")),
        b = matrix(text(i, "b"));
      if (a[0].length !== b.length)
        throw Error("Matrix inner dimensions must match");
      return {
        matrix: a.map((row) =>
          b[0].map((_, j) => row.reduce((sum, v, k) => sum + v * b[k][j], 0)),
        ),
      };
    },
    { matrix: [[17], [39]] },
  ),
  d(
    "math.matrix.determinant",
    "矩阵行列式",
    "Matrix determinant",
    "部分选主元消元法计算行列式，使用浮点数近似。",
    "Math",
    { text: s },
    "number",
    { text: "[[1,2],[3,4]]" },
    (i) => elimination(matrix(text(i)), [] as number[][]).determinant,
    -2,
  ),
  d(
    "math.matrix.solve",
    "线性方程组求解",
    "Solve linear system",
    "输入系数矩阵 A 和列矩阵 b；用浮点消元计算 Ax=b。",
    "Math",
    { a: s, b: s },
    "object",
    { a: "[[2,1],[1,-1]]", b: "[[5],[1]]" },
    (i) => {
      const a = matrix(text(i, "a")),
        b = matrix(text(i, "b"));
      if (a.length !== b.length || b[0].length !== 1)
        throw Error("b must be a column matrix matching A");
      const v = elimination(a, b);
      if (!v.determinant) throw Error("Singular matrix: no unique solution");
      return { solution: v.result.map((r) => r[0]) };
    },
    { solution: [2, 1] },
  ),
  d(
    "math.matrix.inverse",
    "矩阵求逆",
    "Invert matrix",
    "用部分选主元消元法求逆；浮点计算，不适用于病态精确计算。",
    "Math",
    { text: s },
    "object",
    { text: "[[2,0],[0,4]]" },
    (i) => {
      const a = matrix(text(i)),
        v = elimination(
          a,
          a.map((_, j) => a.map((_, k) => (j === k ? 1 : 0))),
        );
      if (!v.determinant) throw Error("Singular matrix has no inverse");
      return { matrix: v.result };
    },
    {
      matrix: [
        [0.5, 0],
        [0, 0.25],
      ],
    },
  ),
  d(
    "math.combinations",
    "组合数计算",
    "Binomial coefficient",
    "以任意精度整数计算 C(n,k)，n 最大 1000。",
    "Math",
    {
      n: { ...n, minimum: 0, maximum: 1000 },
      k: { ...n, minimum: 0, maximum: 1000 },
    },
    "string",
    { n: 52, k: 5 },
    (i) => {
      const a = integer(num(i, "n"), 0, 1000),
        b = integer(num(i, "k"), 0, a),
        k = Math.min(b, a - b);
      let v = 1n;
      for (let j = 1; j <= k; j++) v = (v * BigInt(a - k + j)) / BigInt(j);
      return v.toString();
    },
    "2598960",
  ),
  d(
    "math.factorial",
    "大整数阶乘",
    "Big integer factorial",
    "以任意精度整数计算 0–1000 的阶乘，返回十进制字符串。",
    "Math",
    { value: { ...n, minimum: 0, maximum: 1000 } },
    "string",
    { value: 20 },
    (i) => {
      const a = integer(num(i, "value"), 0, 1000);
      let v = 1n;
      for (let j = 2; j <= a; j++) v *= BigInt(j);
      return v.toString();
    },
    "2432902008176640000",
  ),
  d(
    "numbers.primality",
    "质数判断",
    "Primality test",
    "精确判断 0–10 亿整数是否为质数，使用有界试除法。",
    "Numbers",
    { value: { ...n, minimum: 0, maximum: 1e9 } },
    "boolean",
    { value: 104729 },
    (i) => {
      const v = integer(num(i, "value"), 0, 1e9);
      if (v < 2) return false;
      if (v % 2 === 0) return v === 2;
      for (let j = 3; j * j <= v; j += 2) if (v % j === 0) return false;
      return true;
    },
    true,
  ),
  d(
    "math.fraction.reduce",
    "分数约分",
    "Reduce fraction",
    "将整数分子、非零分母约至最简，支持最多 500 位整数。",
    "Math",
    { numerator: s, denominator: s },
    "object",
    { numerator: "-42", denominator: "-56" },
    (i) => {
      let a = big(text(i, "numerator")),
        b = big(text(i, "denominator"));
      if (!b) throw Error("Denominator must not be zero");
      if (b < 0) {
        a = -a;
        b = -b;
      }
      let x = a < 0 ? -a : a,
        y = b;
      while (y) {
        [x, y] = [y, x % y];
      }
      return { numerator: (a / x).toString(), denominator: (b / x).toString() };
    },
    { numerator: "3", denominator: "4" },
  ),
];
