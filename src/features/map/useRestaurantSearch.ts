// 브라우저 Geolocation API로 현재 위치(lat/lng)를 가져온 뒤, 그 좌표 + 검색어(query) + 페이지(page)로 GET /api/restaurants를 호출
// 위치 확보는 최초 1회만 하고(재요청은 retryLocation으로만), 이후 query/page가 바뀌면 같은 좌표로 다시 조회함
// 위치 실패와 API 실패는 원인이 달라서(권한/기기 vs 서버) 상태를 분리해 재시도 문구·동작을 다르게 둠
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import type { SearchResponse } from "./types";

type Coords = { lat: number; lng: number };

type SearchState =
  | { status: "locating" }
  | { status: "location-error"; message: string }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: SearchResponse };

// GeolocationPositionError.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
const GEO_ERROR_MESSAGES: Record<number, string> = {
  1: "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용한 뒤 다시 시도해 주세요.",
  2: "현재 위치를 확인할 수 없습니다.",
  3: "위치를 가져오는 데 시간이 너무 오래 걸립니다.",
};

export function useRestaurantSearch(query: string, page: number, size: number) {
  const { token } = useAuth();
  const [state, setState] = useState<SearchState>({ status: "locating" });
  const [coords, setCoords] = useState<Coords | null>(null);
  const coordsRef = useRef<Coords | null>(null);

  const fetchRestaurants = useCallback(
    async (coords: Coords, q: string, p: number) => {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams({
          lat: String(coords.lat),
          lng: String(coords.lng),
          page: String(p),
          size: String(size),
        });
        if (q.trim()) params.set("q", q.trim());
        const result = await apiFetch<SearchResponse>(
          `/api/restaurants?${params.toString()}`,
          { token },
        );
        setState({ status: "ready", result });
      } catch (e) {
        setState({
          status: "error",
          message:
            e instanceof ApiError
              ? e.message
              : "식당을 불러오지 못했습니다. 다시 시도해 주세요.",
        });
      }
    },
    [token, size],
  );

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({
        status: "location-error",
        message: "이 브라우저에서는 위치 정보를 사용할 수 없습니다.",
      });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        coordsRef.current = coords;
        setCoords(coords);
        fetchRestaurants(coords, query, page);
      },
      (err) => {
        setState({
          status: "location-error",
          message:
            GEO_ERROR_MESSAGES[err.code] ?? "현재 위치를 확인할 수 없습니다.",
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 진입 시점 query/page만 쓰고, 이후 변경은 아래 별도 effect가 처리
  }, [fetchRestaurants]);

  // 최초 진입 — 위치를 확보하고 첫 조회를 실행
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 위치가 이미 확보된 뒤 query/page가 바뀌면 같은 좌표로 재조회 (위치는 다시 안 물어봄)
  useEffect(() => {
    if (!coordsRef.current) return;
    fetchRestaurants(coordsRef.current, query, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  const retry = useCallback(() => {
    if (coordsRef.current) fetchRestaurants(coordsRef.current, query, page);
  }, [fetchRestaurants, query, page]);

  return { ...state, coords, retryLocation: locate, retry };
}
