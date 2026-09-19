import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import type { FoodDetail } from "./foodTypes";

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: FoodDetail };

export function useFoodDetail(
  foodId: string | undefined,
  coords: { lat: number; lng: number } | null,
) {
  const { token } = useAuth();
  const [state, setState] = useState<DetailState>({ status: "loading" });

  const fetchDetail = useCallback(
    async (id: string, c: { lat: number; lng: number } | null) => {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams();
        if (c) {
          params.set("lat", String(c.lat));
          params.set("lng", String(c.lng));
        }
        const qs = params.toString();
        const result = await apiFetch<FoodDetail>(
          `/api/foods/${encodeURIComponent(id)}${qs ? `?${qs}` : ""}`,
          { token },
        );
        setState({ status: "ready", result });
      } catch (e) {
        setState({
          status: "error",
          message:
            e instanceof ApiError
              ? e.message
              : "음식 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
        });
      }
    },
    [token],
  );

  useEffect(() => {
    if (!foodId) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) fetchDetail(foodId, coords);
    });
    return () => {
      cancelled = true;
    };
  }, [foodId, coords, fetchDetail]);

  const retry = useCallback(() => {
    if (foodId) fetchDetail(foodId, coords);
  }, [foodId, coords, fetchDetail]);

  return { ...state, retry };
}
