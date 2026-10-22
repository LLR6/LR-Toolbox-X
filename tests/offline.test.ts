import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
const modulePath = "../scripts/offline-worker.mjs";
const { offlineWorker } = await import(modulePath);
function worker(
  network: (request: { url: string }, options?: object) => Promise<Response>,
) {
  const listeners = new Map<
    string,
    (event: {
      request?: object;
      respondWith?: (value: Promise<Response>) => void;
      waitUntil?: (value: Promise<unknown>) => void;
    }) => void
  >();
  const removed: string[] = [];
  const cache = {
    match: async (key: string | { url: string }) =>
      typeof key === "string" && key === "./index.html"
        ? new Response("cached workspace")
        : undefined,
    addAll: async () => {},
  };
  runInNewContext(offlineWorker("lrx-new", ["./", "./index.html"]), {
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (
        name: string,
        handler: typeof listeners extends Map<string, infer V> ? V : never,
      ) => listeners.set(name, handler),
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches: {
      open: async () => cache,
      keys: async () => ["lrx-old", "lrx-new", "other-app"],
      delete: async (key: string) => {
        removed.push(key);
        return true;
      },
    },
    fetch: network,
    URL,
    Response,
    AbortController,
    setTimeout,
    clearTimeout,
  });
  return {
    removed,
    lifecycle(name: string) {
      let result: Promise<unknown> | undefined;
      listeners.get(name)!({
        waitUntil: (value) => {
          result = value;
        },
      });
      return result;
    },
    request(
      mode = "navigate",
      url = "https://example.test/?version=new",
      method = "GET",
    ) {
      let result: Promise<Response> | undefined;
      listeners.get("fetch")!({
        request: { mode, url, method },
        respondWith: (value) => {
          result = value;
        },
      });
      return result;
    },
  };
}
test("navigation fetches the latest HTML even when an offline shell exists", async () => {
  let policy: object | undefined;
  const sw = worker(async (_, options) => {
    policy = options;
    return new Response("latest full-page workspace");
  });
  assert.equal(
    await (await sw.request())!.text(),
    "latest full-page workspace",
  );
  assert.equal((policy as { cache: string }).cache, "no-store");
});
test("offline and failed navigation fall back to the cached shell, including query URLs", async () => {
  for (const network of [
    async () => {
      throw Error("offline");
    },
    async () => new Response("Unavailable", { status: 503 }),
  ]) {
    const sw = worker(network);
    assert.equal(await (await sw.request())!.text(), "cached workspace");
  }
});
test("worker activation removes only obsolete toolbox caches", async () => {
  const sw = worker(async () => new Response("asset"));
  await sw.lifecycle("install");
  await sw.lifecycle("activate");
  assert.deepEqual(sw.removed, ["lrx-old"]);
});
test("cross-origin and non-GET requests are never intercepted", () => {
  const sw = worker(async () => new Response("asset"));
  assert.equal(sw.request("cors", "https://elsewhere.test/"), undefined);
  assert.equal(sw.request("cors", "https://example.test/", "POST"), undefined);
});
