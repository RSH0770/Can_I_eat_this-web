import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import type { ReviewView } from "../restaurant/useRestaurantReports";

type MyReportsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; reviews: ReviewView[] };

export function useMyReports() {
  const { token } = useAuth();
  const [state, setState] = useState<MyReportsState>({ status: "loading" });

  const fetchReports = useCallback(async () => {
    if (!token) {
      setState({ status: "ready", reviews: [] });
      return;
    }
    try {
      const reviews = await apiFetch<ReviewView[]>("/api/me/reports", {
        token,
      });
      setState({ status: "ready", reviews });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "방문 기록을 불러오지 못했습니다. 다시 시도해 주세요.",
      });
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, [fetchReports]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    fetchReports();
  }, [fetchReports]);

  return { ...state, reload };
}
