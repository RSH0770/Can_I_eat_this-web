// POST /api/order-cards, GET /api/order-cards/{id} 스웨거 기준
export type CardRequest = {
  phrase: string; // 카드에 실제로 찍히는 문구
  original: string; // 다듬기 전 원문
  polished: boolean; // false면 다듬기에 실패해 원문을 그대로 쓴 것
};

export type CardResponse = {
  id: number;
  allergyBanner: string | null; // 없으면 null - 배너 자체를 숨겨야 함
  diseaseLine: string;
  menuLine: string;
  requests: CardRequest[];
  medsLine: string | null; // showMedsOnCard가 false면 null
  footer: string[];
  disclaimer: string;
};
