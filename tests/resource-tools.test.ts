import { test } from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import {
  readPackDocument,
  inspectCalendar,
} from "../apps/web/src/resource-tools.ts";
import { studioShortcut, isVisualStudio } from "../apps/web/src/studios.ts";
test("resource text reader extracts only selected text and never interprets markup", () => {
  const zip = zipSync({
    "notes/a.md": strToU8("<script>alert(1)</script>\n中文"),
    "program.exe": new Uint8Array([1, 2]),
    "large.txt": new Uint8Array(256001),
  });
  assert.equal(
    readPackDocument(zip, "notes/a.md"),
    "<script>alert(1)</script>\n中文",
  );
  assert.throws(() => readPackDocument(zip, "program.exe"), /仅预览/);
  assert.throws(() => readPackDocument(zip, "large.txt"), /256 KB/);
  assert.throws(() => readPackDocument(zip, "absent.md"), /没有此文件/);
  assert.throws(
    () => readPackDocument(new Uint8Array(12000001), "a.md"),
    /12 MB/,
  );
});
test("calendar preserves original TZID, escaped text and recurrence without expansion", async () => {
  const source =
    "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART;TZID=Asia/Shanghai:20261024T090000\r\nDTEND;TZID=Asia/Shanghai:20261024T100000\r\nSUMMARY:学习\\,复习\r\nRRULE:FREQ=DAILY;COUNT=3\r\nEND:VEVENT\r\nEND:VCALENDAR";
  const events = await inspectCalendar(source);
  assert.equal(events.length, 1);
  assert.equal(events[0].zone, "Asia/Shanghai");
  assert.equal(events[0].title, "学习,复习");
  assert.match(events[0].recurrence, /COUNT=3/);
  await assert.rejects(inspectCalendar("x".repeat(500001)), /500000/);
  await assert.rejects(inspectCalendar("not a calendar"));
});
test("new workspaces route separately and uploaded tools are searchable", () => {
  assert.equal(studioShortcut("sqlmap")?.id, "resources");
  assert.equal(studioShortcut("刷机")?.id, "resources");
  assert.equal(studioShortcut("识别二维码")?.id, "qrread");
  assert.equal(studioShortcut("ICS")?.id, "calendar");
  assert.equal(isVisualStudio("resources"), false);
});
