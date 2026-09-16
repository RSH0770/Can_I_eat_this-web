// mode: "existing" → 이미 만들어진 카드를 GET /api/order-cards/{id}로 조회 (예: 내 기록에서 다시 보기)
// mode: "create"   → POST /api/order-cards로 새로 생성 (식당 상세에서 처음 만드는 경우)
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "../../../lib/apiClient";
import { useAuth } from "../../../context/AuthContext";
import type { CardResponse } from "./types";

export type OrderCardParams =
  | { mode: "existing"; cardId: number }
  | { mode: "create"; restaurantId: number; requests: string[] };

type OrderCardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; card: CardResponse };

export function useOrderCard(params: OrderCardParams) {
  const { token } = useAuth();
  const [state, setState] = useState<OrderCardState>({ status: "loading" });
  const paramsRef = useRef(params);

  const run = useCallback(async () => {
    setState({ status: "loading" });
    const p = paramsRef.current;
    try {
      const card =
        p.mode === "existing"
          ? await apiFetch<CardResponse>(`/api/order-cards/${p.cardId}`, {
              token,
            })
          : await apiFetch<CardResponse>("/api/order-cards", {
              method: "POST",
              token,
              body: {
                restaurantId: p.restaurantId,
                // 카드 생성 자체엔 의미 없는 값이지만, 백엔드가 제보(POST /api/reports)와 완전히 같은 CreateRequest 스키마를 재사용해서 필수(required)로 요구함
                // CardResponse 응답에 ok가 없는 걸 보면 카드 생성 로직은 이 값을 쓰지 않는 것으로 보임 — 검증만 통과시키기 위한 더미 값
                ok: true,
                ...(p.requests.length > 0 ? { requests: p.requests } : {}),
              },
            });
      setState({ status: "ready", card });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : p.mode === "create"
              ? "카드를 만들지 못했습니다. 다시 시도해 주세요."
              : "카드를 불러오지 못했습니다. 다시 시도해 주세요.",
      });
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 진입 1회만: paramsRef로 이후 변경은 의도적으로 무시
  }, []);

  const reload = useCallback(() => {
    run();
  }, [run]);

  return { ...state, reload };
}
