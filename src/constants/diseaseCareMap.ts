export const DISEASES = [
  "당뇨",
  "고혈압",
  "이상지질혈증",
  "만성콩팥병",
  "통풍",
] as const;
export type Disease = (typeof DISEASES)[number];

export const CARES = [
  "나트륨",
  "당류",
  "정제 탄수화물",
  "포화지방",
  "칼륨",
  "퓨린",
  "단백질량",
] as const;
export type Care = (typeof CARES)[number];

export const ALLERGENS = [
  "난류",
  "우유",
  "메밀",
  "땅콩",
  "대두",
  "밀",
  "고등어",
  "게",
  "새우",
  "돼지고기",
  "복숭아",
  "토마토",
  "호두",
  "닭고기",
  "쇠고기",
  "오징어",
  "조개류",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const MEDS = ["혈압약", "항응고제(와피린)", "당뇨약", "이뇨제"] as const;
export type Med = (typeof BLOODS)[number];

export const BLOODS = ["A형", "B형", "O형", "AB형"] as const;
export type Blood = (typeof BLOODS)[number];

// 질환을 고르면 회원가입 4단계(주의 성분)에 미리 담기는 항목
export const DISEASE_CARE_MAP: Record<Disease, Care[]> = {
  당뇨: ["당류", "정제 탄수화물"],
  고혈압: ["나트륨", "포화지방"],
  이상지질혈증: ["정제 탄수화물", "포화지방"],
  만성콩팥병: ["나트륨", "칼륨", "단백질량"],
  통풍: ["나트륨", "퓨린"],
};

// 주의 성분을 골랐을 때 보여주는 한 줄 설명
export const CARE_NOTES: Record<Care, string> = {
  나트륨: "국물∙양념∙젓갈에 몰려 있어요",
  당류: "초고추장∙조림장에 설탕이 들어가요",
  "정제 탄수화물": "흰밥∙면 양이 혈당을 좌우해요",
  포화지방: "껍질∙비계∙진한 국물에 많아요",
  칼륨: "채소∙해조류를 데치면 줄어요",
  퓨린: "진한 육수와 내장∙등푸른 생선에 많아요",
  단백질량: "한 끼에 들어가는 고기∙생선∙두부 양으로 조절해요",
};

// 선택된 질환 목록으로부터 매핑된 주의 성분을 중복 없이 모아 반환
export function autoCaresFor(diseases: string[]): Care[] {
  const out: Care[] = [];
  diseases.forEach((d) => {
    (DISEASE_CARE_MAP[d as Disease] ?? []).forEach((c) => {
      if (!out.includes(c)) out.push(c);
    });
  });
  return out;
}
