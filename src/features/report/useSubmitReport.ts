import { useCallback, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { linkReportToPendingCard } from "../../lib/orderCardLinks";
import type { ReviewView } from "../restaurant/useRestaurantReports";

export type SubmitReportPayload = {
  restaurantId: number;
  ok: boolean;
  note: string;
  requests: string[];
  feedback: string[];
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "done" };

export function useSubmitReport() {
  const { token } = useAuth();
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const submit = useCallback(
    async (payload: SubmitReportPayload): Promise<boolean> => {
      setState({ status: "submitting" });
      try {
        const created = await apiFetch<ReviewView>("/api/reports", {
          method: "POST",
          token,
          body: {
            restaurantId: payload.restaurantId,
            ok: payload.ok,
            ...(payload.note.trim() ? { note: payload.note.trim() } : {}),
            ...(payload.requests.length > 0
              ? { requests: payload.requests }
              : {}),
            ...(payload.feedback.length > 0
              ? { feedback: payload.feedback }
              : {}),
          },
        });
        linkReportToPendingCard(payload.restaurantId, created.id);
        setState({ status: "done" });
        return true;
      } catch (e) {
        setState({
          status: "error",
          message:
            e instanceof ApiError
              ? e.message
              : "제보를 보내지 못했습니다. 다시 시도해 주세요.",
        });
        return false;
      }
    },
    [token],
  );

  return { ...state, submit };
}
