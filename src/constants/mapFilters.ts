// 지도 화면(MapPage.tsx) 상단 필터 칩
// 백엔드 응답의 flags(SearchItem.flags / RestaurantDetailResponse.flags) 문자열과 정확히 일치해야 토글이 동작함
export const FILTERS: string[] = [
  "알레르기 표기 있음",
  "저염 요청 가능",
  "입식 좌석",
  "경사로",
];

export const FILTER_LABELS: Record<string, string> = {
  "알레르기 표기 있음": "알레르기 표기",
  "저염 요청 가능": "저염 가능",
  "입식 좌석": "입식",
  경사로: "경사로",
};
