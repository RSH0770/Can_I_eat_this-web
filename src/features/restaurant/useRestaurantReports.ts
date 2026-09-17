import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

export type ReviewView = {
  id: number;
  author: string;
  mine: boolean;
  date: string;
  ok: boolean;
  symbol: string;
  note: string;
  requests: string[];
  feedback: string[];
};

export type ReviewListResponse = {
  restaurantId: number;
  count: number;
  reviews: ReviewView[];
  derivedFlags: string[];
};

type ReportsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ReviewListResponse };

export function useRestaurantReports(restaurantId: string | undefined) {
  const { token } = useAuth();
  const [state, setState] = useState<ReportsState>({ status: "loading" });

  const fetchReports = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await apiFetch<ReviewListResponse>(
        `/api/restaurants/${restaurantId}/reports`,
        { token },
      );
      setState({ status: "ready", data });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "후기를 불러오지 못했습니다. 다시 시도해 주세요.",
      });
    }
  }, [restaurantId, token]);

  useEffect(() => {
    if (!restaurantId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, [restaurantId, fetchReports]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    fetchReports();
  }, [fetchReports]);

  return { ...state, reload };
}
