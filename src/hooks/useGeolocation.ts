// 브라우저 Geolocation API 공통 래퍼 — 좌표만 필요한 화면(지역 음식 등)에서 재사용
import { useCallback, useEffect, useState } from "react";

export type GeoState =
  | { status: "locating" }
  | { status: "error"; message: string }
  | { status: "ready"; coords: { lat: number; lng: number } };

const GEO_ERROR_MESSAGES: Record<number, string> = {
  1: "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용한 뒤 다시 시도해 주세요.",
  2: "현재 위치를 확인할 수 없습니다.",
  3: "위치를 가져오는 데 시간이 너무 오래 걸립니다.",
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "locating" });

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({
        status: "error",
        message: "이 브라우저에서는 위치 정보를 사용할 수 없습니다.",
      });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "ready",
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      (err) =>
        setState({
          status: "error",
          message:
            GEO_ERROR_MESSAGES[err.code] ?? "현재 위치를 확인할 수 없습니다.",
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) locate();
    });
    return () => {
      cancelled = true;
    };
  }, [locate]);

  return { ...state, retry: locate };
}
