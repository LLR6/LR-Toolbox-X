import { unzipSync, strFromU8 } from "fflate";

export function readPackDocument(data: Uint8Array, path: string): string {
  if (data.byteLength > 12_000_000) throw Error("文档 ZIP 最大 12 MB");
  if (!/\.(md|txt|py|json|ini|xml)$/i.test(path)) throw Error("仅预览文本文件");
  const files = unzipSync(data, {
    filter: (entry) => {
      if (entry.name !== path) return false;
      if (entry.originalSize > 256_000) throw Error("单份文本最大 256 KB");
      return true;
    },
  });
  if (!files[path]) throw Error("该 ZIP 中没有此文件，请选择原始资料包");
  return strFromU8(files[path]);
}

export async function inspectCalendar(source: string) {
  if (source.length > 500_000) throw Error("ICS 最大 500000 字符");
  const { default: ICAL } = await import("ical.js");
  const component = new ICAL.Component(ICAL.parse(source));
  if (component.name !== "vcalendar")
    throw Error("请选择 VCALENDAR 格式的 ICS");
  const events = component.getAllSubcomponents("vevent");
  if (events.length > 500) throw Error("最多 500 个事件");
  return events.map((event) => ({
    title: String(event.getFirstPropertyValue("summary") ?? "未命名事件"),
    start: String(event.getFirstPropertyValue("dtstart") ?? ""),
    end: String(event.getFirstPropertyValue("dtend") ?? ""),
    zone: String(
      event.getFirstProperty("dtstart")?.getParameter("tzid") ??
        "UTC / 浮动时间 / 全天",
    ),
    location: String(event.getFirstPropertyValue("location") ?? ""),
    recurrence: String(event.getFirstPropertyValue("rrule") ?? ""),
  }));
}

/** Incremental hashing also works in local HTTP previews without WebCrypto. */
export async function digestBlob(blob: Blob): Promise<string> {
  if (blob.size > 300_000_000) throw Error("资源包最大 300 MB");
  const { sha256 } = await import("@noble/hashes/sha2.js");
  const hash = sha256.create();
  try {
    for (let offset = 0; offset < blob.size; offset += 4_194_304) {
      hash.update(
        new Uint8Array(
          await blob.slice(offset, offset + 4_194_304).arrayBuffer(),
        ),
      );
    }
    return Array.from(hash.digest(), (value) =>
      value.toString(16).padStart(2, "0"),
    ).join("");
  } finally {
    hash.destroy();
  }
}
