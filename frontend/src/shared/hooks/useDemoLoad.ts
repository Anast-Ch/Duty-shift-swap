import { useEffect, useState } from "react";

export type LoadStatus = "loading" | "error" | "ready";

type DemoMode = "ok" | "error" | "empty";

const STORAGE_KEY = "demoMode";

function isDemoMode(value: string | null): value is DemoMode {
  return value === "ok" || value === "error" || value === "empty";
}

function readDemoMode(): DemoMode {
  const fromUrl = new URLSearchParams(window.location.search).get("mock");
  if (isDemoMode(fromUrl)) {
    if (fromUrl === "ok") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(STORAGE_KEY, fromUrl);
    }
    return fromUrl;
  }
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (stored === "error" || stored === "empty") {
    return stored;
  }
  return "ok";
}

const demoMode: DemoMode = readDemoMode();

export function useDemoLoad(): {
  status: LoadStatus;
  forceEmpty: boolean;
  retry: () => void;
} {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setStatus(demoMode === "error" && attempt === 0 ? "error" : "ready");
    }, 600);
    return () => window.clearTimeout(timerId);
  }, [attempt]);

  function retry() {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }

  return { status, forceEmpty: demoMode === "empty", retry };
}
