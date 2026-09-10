export type SealKind = "red" | "ink" | "ok";

export const SEAL_INFO: Record<SealKind, { mark: string; label: string }> = {
  red: { mark: "✕", label: "알레르기 주의" },
  ink: { mark: "△", label: "조절하면 가능" },
  ok: { mark: "○", label: "먹어도 돼요!" },
};

// 알레르기가 하나라도 겹치면 최우선으로 red, 그 다음 주의 성분이 겹치면 ink, 둘 다 아니면 ok
export function judge(
  itemAllergens: string[],
  itemCares: string[],
  userAllergies: string[],
  userCares: string[],
): SealKind {
  if (itemAllergens.some((a) => userAllergies.includes(a))) return "red";
  if (itemCares.some((c) => userCares.includes(c))) return "ink";
  return "ok";
}

// 식당 전체 등급 — 메뉴 중 하나라도 ok면 ok, 아니면 하나라도 ink면 ink, 전부 red면 red
export function judgeRest(
  menus: { allergens: string[]; cares: string[] }[],
  userAllergies: string[],
  userCares: string[],
): SealKind {
  const kinds = menus.map((m) =>
    judge(m.allergens, m.cares, userAllergies, userCares),
  );
  if (kinds.includes("ok")) return "ok";
  if (kinds.includes("ink")) return "ink";
  return "red";
}
