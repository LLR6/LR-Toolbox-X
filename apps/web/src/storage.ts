export interface Run {
  id: string;
  time: string;
  status: "success" | "error";
  elapsedMs: number;
}
export function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem("lrx." + key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown) {
  try {
    localStorage.setItem("lrx." + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function download(
  name: string,
  text: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
