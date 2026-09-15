// GET /api/restaurants/{id} 호출 전용 훅
// lat/lng는 선택값이라 지금은 안 넘김
//  — 넘기면 distanceM/walkMinutes가 채워지는데, 이 화면이 아직 거리를 표시하지 않아서 생략했다. 나중에 거리 표시가 필요해지면 Geolocation으로 받은 좌표를 이 훅의 인자로 추가하면 됨
import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import type { RestaurantDetailResponse } from "./types";

type RestaurantDetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; restaurant: RestaurantDetailResponse };

export function useRestaurantDetail(restaurantId: string | undefined) {
  const { token } = useAuth();
  const [state, setState] = useState<RestaurantDetailState>({
    status: "loading",
  });

  const fetchDetail = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const restaurant = await apiFetch<RestaurantDetailResponse>(
        `/api/restaurants/${restaurantId}`,
        {
          token,
        },
      );
      setState({ status: "ready", restaurant });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "식당 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
      });
    }
  }, [restaurantId, token]);

  useEffect(() => {
    if (!restaurantId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
  }, [restaurantId, fetchDetail]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    fetchDetail();
  }, [fetchDetail]);

  return { ...state, reload };
}
