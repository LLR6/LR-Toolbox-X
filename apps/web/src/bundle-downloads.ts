/** Build a flat ZIP with unique, bounded names; never use source names as paths. */
export async function bundleDownloads(
  files: readonly { name: string; blob: Blob }[],
) {
  if (!files.length || files.length > 32)
    throw Error("请选择 1–32 个结果 / Select 1–32 results");
  if (files.reduce((n, f) => n + f.blob.size, 0) > 64000000)
    throw Error("打包内容超过 64 MB / Bundle exceeds 64 MB");
  const entries = await Promise.all(
    files.map(async (file, index) => {
      const base = Array.from(file.name.split(/[\\/]/).pop() || "result")
        .slice(0, 140)
        .map((c) => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? "_" : c))
        .join("")
        .replace(/[<>:"|?*]/g, "_");
      return [
        `${String(index + 1).padStart(2, "0")}-${base}`,
        new Uint8Array(await file.blob.arrayBuffer()),
      ] as const;
    }),
  );
  const { zipSync } = await import("fflate");
  return new Blob(
    [
      zipSync(Object.fromEntries(entries), {
        level: 0,
      }) as Uint8Array<ArrayBuffer>,
    ],
    { type: "application/zip" },
  );
}
