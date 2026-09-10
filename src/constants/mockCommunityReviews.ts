// TODO: 실제 데이터로 교체 예정. 디자인 원본의 COMMUNITY 상수를 그대로 옮김
// 식당 상세의 "후기" 섹션에서 식당 id(RESTS의 id)로 조회함
// 원본에는 이 목록에 로그인한 사용자 본인의 방문 기록("내 후기")도 합쳐지지만, 저장소가 아직 없어서 지금은 커뮤니티 후기만 보여줌
// 내 기록 기능을 만들 때 내 기록 store를 여기 reviews 앞에 합치면 됨
export type CommunityReview = {
  who: string;
  date: string;
  ok: boolean;
  note: string;
  feedback: string[];
};

export const COMMUNITY_REVIEWS: Record<string, CommunityReview[]> = {
  r1: [
    {
      who: "60대 · 당뇨",
      date: "8월 18일",
      ok: true,
      note: "짜지 않은 순두부를 따로 팔아서 편했습니다. 양념장도 종이컵에 따로 담아 주셨어요.",
      feedback: ["요청이 그대로 전달됐어요", "간을 약하게 해 주셨어요"],
    },
    {
      who: "40대 · 만성콩팥병",
      date: "8월 9일",
      ok: true,
      note: "반찬 중 젓갈을 빼 달라고 하니 바로 바꿔 주셨습니다.",
      feedback: ["직원이 다시 확인해 주셨어요"],
    },
  ],
  r2: [
    {
      who: "50대 · 고혈압",
      date: "8월 12일",
      ok: false,
      note: "초고추장을 따로 달라는 요청이 주방까지 전달되지 않았습니다.",
      feedback: ["요청을 전하기 어려웠어요"],
    },
  ],
  r3: [
    {
      who: "70대 · 당뇨",
      date: "7월 30일",
      ok: true,
      note: "국물을 따로 담아 주셔서 면만 덜어 먹었습니다.",
      feedback: ["국물을 따로 담아 주셨어요"],
    },
  ],
  r4: [
    {
      who: "60대 · 이상지질혈증",
      date: "8월 3일",
      ok: true,
      note: "나물 위주라 부담이 적었고 재료를 모두 알려 주셨습니다.",
      feedback: ["메뉴에 재료 표기가 있었어요"],
    },
  ],
};
