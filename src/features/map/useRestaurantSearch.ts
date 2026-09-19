import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import type { SearchResponse } from "./types";

type Coords = { lat: number; lng: number };

type SearchState =
  | { status: "idle" } // 좌표가 아직 없음(위치 확인/지역 선택 대기 중)
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: SearchResponse };

export function useRestaurantSearch(
  query: string,
  page: number,
  size: number,
  coords: Coords | null,
  radius: number,
) {
  const { token } = useAuth();
  const [state, setState] = useState<SearchState>({ status: "idle" });

  const fetchRestaurants = useCallback(
    async (c: Coords, q: string, p: number, r: number) => {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams({
          lat: String(c.lat),
          lng: String(c.lng),
          radius: String(r),
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

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (!coords) {
        setState({ status: "idle" });
        return;
      }
      fetchRestaurants(coords, query, page, radius);
    });
    return () => {
      cancelled = true;
    };
  }, [coords, query, page, radius, fetchRestaurants]);

  const retry = useCallback(() => {
    if (coords) fetchRestaurants(coords, query, page, radius);
  }, [coords, fetchRestaurants, query, page, radius]);

  return { ...state, retry };
}
