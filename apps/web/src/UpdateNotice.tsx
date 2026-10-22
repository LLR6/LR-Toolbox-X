import { useEffect, useState } from "react";
import { UiIcon } from "./Icons.tsx";

export function UpdateNotice({ enabled }: { enabled: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled || !("serviceWorker" in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    let controlled = !!navigator.serviceWorker.controller;
    const changed = () => {
      if (controlled) setReady(true);
      controlled = true;
    };
    const check = () => {
      if (navigator.onLine && document.visibilityState === "visible")
        void registration?.update().catch(() => {});
    };
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    window.addEventListener("online", check);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    void navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((value) => {
        if (disposed) return;
        registration = value;
        check();
      })
      .catch(() => console.warn("Offline cache unavailable"));
    const timer = setInterval(check, 30 * 60 * 1000);
    return () => {
      disposed = true;
      clearInterval(timer);
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
      window.removeEventListener("online", check);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [enabled]);
  if (!ready) return null;
  const en = document.documentElement.lang === "en";
  return (
    <aside
      className="update-notice"
      aria-label={en ? "App update" : "版本更新"}
    >
      <UiIcon name="download" />
      <div>
        <strong>{en ? "New version ready" : "新版本已就绪"}</strong>
        <p>
          {en
            ? "Save your current output, then refresh. Favorites and history are kept."
            : "保存当前结果后刷新。收藏和历史记录会保留。"}
        </p>
      </div>
      <button onClick={() => location.reload()}>
        {en ? "Refresh" : "刷新使用新版"}
      </button>
    </aside>
  );
}
