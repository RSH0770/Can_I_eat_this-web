// GET /api/order-cards/{id} 호출 전용 훅
// cardId가 null이면 아무 요청도 하지 않고 "idle"에 머물게 됨
// 이 화면이 cardId 없이 열리는 경우가 더 많으니, 이때는 이 훅의 상태를 아예 쳐다보지 않음

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../../lib/apiClient";
import { useAuth } from "../../../context/AuthContext";
import type { CardResponse } from "./types";

type OrderCardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; card: CardResponse };

export function useOrderCard(cardId: number | null) {
  const { token } = useAuth();
  // cardId는 이 화면에 들어올 때 location.state로 한 번 정해지고 이후 안 바뀐다고 가정함
  // 그래서 초기값만 cardId 유무로 나누고, 바뀌는 경우까지는 다루지 않음
  const [state, setState] = useState<OrderCardState>(
    cardId == null ? { status: "idle" } : { status: "loading" },
  );

  const fetchCard = useCallback(async () => {
    if (cardId == null) return;
    try {
      const card = await apiFetch<CardResponse>(`/api/order-cards/${cardId}`, {
        token,
      });
      setState({ status: "ready", card });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "카드를 불러오지 못했습니다. 다시 시도해 주세요.",
      });
    }
  }, [cardId, token]);

  useEffect(() => {
    if (cardId == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCard();
  }, [cardId, fetchCard]);

  const reload = useCallback(() => {
    if (cardId == null) return;
    setState({ status: "loading" });
    fetchCard();
  }, [cardId, fetchCard]);

  return { ...state, reload };
}
