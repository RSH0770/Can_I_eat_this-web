// useKakaoMapsSdk.ts
// 카카오맵 JS SDK(window.kakao.maps)를 지연 로드하는 훅
import { useEffect, useState } from "react";

export type KakaoSdkStatus = "missing-key" | "loading" | "ready" | "error";

const KAKAO_SCRIPT_ID = "kakao-maps-sdk";

export function useKakaoMapsSdk(): KakaoSdkStatus {
  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  const [status, setStatus] = useState<KakaoSdkStatus>(() => {
    if (!appKey) return "missing-key";
    return typeof window !== "undefined" && window.kakao?.maps
      ? "ready"
      : "loading";
  });

  useEffect(() => {
    if (!appKey) {
      return;
    }
    if (window.kakao?.maps) {
      return;
    }

    let cancelled = false;

    function handleReady() {
      window.kakao.maps.load(() => {
        if (!cancelled) setStatus("ready");
      });
    }
    function handleError() {
      if (!cancelled) setStatus("error");
    }

    const existing = document.getElementById(
      KAKAO_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", handleReady);
      existing.addEventListener("error", handleError);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", handleReady);
        existing.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = KAKAO_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.addEventListener("load", handleReady);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", handleReady);
      script.removeEventListener("error", handleError);
    };
  }, [appKey]);

  return status;
}
