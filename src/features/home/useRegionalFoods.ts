import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import type { FoodListResponse } from "./foodTypes";

type FoodsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: FoodListResponse };

export function useRegionalFoods(coords: { lat: number; lng: number } | null) {
  const { token } = useAuth();
  const [state, setState] = useState<FoodsState>({ status: "loading" });

  const fetchFoods = useCallback(
    async (c: { lat: number; lng: number }) => {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams({
          lat: String(c.lat),
          lng: String(c.lng),
        });
        const result = await apiFetch<FoodListResponse>(
          `/api/foods?${params.toString()}`,
          { token },
        );
        setState({ status: "ready", result });
      } catch (e) {
        setState({
          status: "error",
          message:
            e instanceof ApiError
              ? e.message
              : "지역 음식을 불러오지 못했습니다. 다시 시도해 주세요.",
        });
      }
    },
    [token],
  );

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) fetchFoods(coords);
    });
    return () => {
      cancelled = true;
    };
  }, [coords, fetchFoods]);

  const retry = useCallback(() => {
    if (coords) fetchFoods(coords);
  }, [coords, fetchFoods]);

  return { ...state, retry };
}
