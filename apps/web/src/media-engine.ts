import type { FFmpeg } from "@ffmpeg/ffmpeg";
const base = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/";
export async function mediaEngine(
  signal: AbortSignal,
  report: (s: string) => void,
): Promise<{ engine: FFmpeg; release: () => void }> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const urls: string[] = [];
  const engine = new FFmpeg();
  const release = () => {
    engine.terminate();
    urls.forEach((url) => URL.revokeObjectURL(url));
  };
  signal.addEventListener("abort", release, { once: true });
  try {
    const cache =
      typeof caches === "undefined"
        ? null
        : await caches.open("toolbox-ffmpeg-0.12.10");
    const assets = await Promise.all(
      ["ffmpeg-core.js", "ffmpeg-core.wasm"].map(async (name) => {
        const url = base + name;
        let response = await cache?.match(url);
        if (!response) {
          report("首次下载音视频引擎（约 31 MB） / Downloading media engine");
          response = await fetch(url, {
            signal: AbortSignal.any([signal, AbortSignal.timeout(180000)]),
            credentials: "omit",
          });
          if (!response.ok)
            throw Error(
              "音视频引擎下载失败，请检查网络 / Engine download failed",
            );
          await cache?.put(url, response.clone());
        }
        const bytes = await response.arrayBuffer();
        if (signal.aborted) throw Error("已取消 / Cancelled");
        const blobUrl = URL.createObjectURL(
          new Blob([bytes], {
            type: name.endsWith(".wasm")
              ? "application/wasm"
              : "text/javascript",
          }),
        );
        urls.push(blobUrl);
        return blobUrl;
      }),
    );
    await engine.load({
      classWorkerURL: new URL("./engines/ffmpeg/worker.js", location.href).href,
      coreURL: assets[0],
      wasmURL: assets[1],
    });
    return { engine, release };
  } catch (e) {
    release();
    throw e;
  }
}
export function mediaArguments(mode: string, start: number, duration: number) {
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(duration) ||
    start < 0 ||
    start > 86400 ||
    duration < 0.1 ||
    duration > 60
  )
    throw Error("开始时间非负，时长 0.1–60 秒 / Duration 0.1–60 seconds");
  const args = [
    "-ss",
    String(start),
    "-protocol_whitelist",
    "file,pipe,data",
    "-i",
    "input",
    "-t",
    String(duration),
    "-map_metadata",
    "-1",
  ];
  if (mode === "audio")
    return {
      args: [
        ...args,
        "-vn",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        "output.mp3",
      ],
      name: "output.mp3",
      mime: "audio/mpeg",
    };
  if (mode === "gif")
    return {
      args: [...args, "-an", "-vf", "fps=10,scale=480:-2", "output.gif"],
      name: "output.gif",
      mime: "image/gif",
    };
  return {
    args: [
      ...args,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "28",
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      "output.mp4",
    ],
    name: "output.mp4",
    mime: "video/mp4",
  };
}
