// GET /api/restaurants/{id} 스웨거 기준
export type SealVerdict = "RED" | "INK" | "OK";

// 컴포넌트 이름(Seal)과 겹치지 않게 ApiSeal로 이름 붙였다.
export type ApiSeal = {
  verdict: SealVerdict;
  symbol: string; // RED=✕, INK=△, OK=○
  label: string; // 사람이 읽는 라벨. 예: "먹어도 돼요!"
};

export type MenuTagAmount = "MAIN" | "TRACE";

export type MenuTagView = {
  value: string; // 성분 이름. 예: "밀"
  amount: MenuTagAmount; // MAIN=주재료(✕), TRACE=양념 미량(△)
  source: string; // LLM 태깅 / 영양성분 DB 등
  estimated: boolean; // true면 확정 성분표가 아니라 추정값
};

export type MenuView = {
  id: number;
  name: string;
  price: number | null; // 스펙상 "항상 null" — 화면에 노출하지 않는다
  representative: boolean;
  tagStatus: string; // 미태깅이면 seal이 비어있음
  seal: ApiSeal | null; // 미태깅이거나 비로그인이면 null (메뉴별 판정은 비관적)
  tags: MenuTagView[]; // 이 메뉴에 붙은 모든 태그(사용자와 무관하게 전부)
  hitMainAllergens: string[]; // 내 알레르기와 겹친 주재료 — 있으면 RED
  hitTraceAllergens: string[]; // 내 알레르기와 겹친 양념 미량 — 이것만 있으면 INK
  hitCares: string[]; // 내 주의성분과 겹친 것
  detail: string; // 판정 이유를 사람이 읽는 문장으로 설명
  suggestedRequests: string[]; // 이 메뉴에 쓸 만한 요청 문구 — 주문요청카드 기본값
};

export type RestaurantDetailResponse = {
  id: number;
  name: string;
  meta: string; // 주소·업종 등 한 줄 요약
  lat: number;
  lng: number;
  distanceM: number | null; // 요청에 lat/lng를 안 주면 null
  walkMinutes: number | null;
  tel: string;
  openTime: string;
  restDate: string;
  parking: string;
  firstImage: string;
  flags: string[]; // 제보 2건 이상으로 도출된 속성
  seal: ApiSeal | null; // 식당 전체 판정(낙관적). 미태깅이면 null
  personalized: boolean; // false면 비로그인이라 판정을 못 한 것
  menus: MenuView[];
  disclaimer: string;
  menusUnavailable: boolean;
};
