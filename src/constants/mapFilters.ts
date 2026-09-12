// 지도 화면(MapPage.tsx) 상단 필터 칩
// RestItem.flags 값과 정확히 일치해야 토글이 동작하므로, mockFoodData.ts의 flags 문자열을 바꾸면 이 목록도 같이 바뀌야 함
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
