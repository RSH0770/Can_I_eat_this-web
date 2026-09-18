// 주문 요청 카드와 제보(내 기록)를 로컬에서만 연결하는 저장소
const PENDING_KEY = "mukeodo:pendingOrderCards";
const LINK_KEY = "mukeodo:reportCardLinks";

type PendingCard = { restaurantId: number; cardId: number; createdAt: number };
type ReportCardLink = { reportId: number; cardId: number };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패해도 동작해야 하므로 무시
  }
}

export function rememberPendingCard(restaurantId: number, cardId: number) {
  const list = readJson<PendingCard[]>(PENDING_KEY, []);
  const next = list.filter((p) => p.restaurantId !== restaurantId);
  next.push({ restaurantId, cardId, createdAt: Date.now() });
  writeJson(PENDING_KEY, next);
}

export function linkReportToPendingCard(
  restaurantId: number,
  reportId: number,
) {
  const pending = readJson<PendingCard[]>(PENDING_KEY, []);
  const match = pending.find((p) => p.restaurantId === restaurantId);
  if (!match) return;

  const links = readJson<ReportCardLink[]>(LINK_KEY, []);
  links.push({ reportId, cardId: match.cardId });
  writeJson(LINK_KEY, links);

  writeJson(
    PENDING_KEY,
    pending.filter((p) => p.restaurantId !== restaurantId),
  );
}

export function getLinkedCardId(reportId: number): number | null {
  const links = readJson<ReportCardLink[]>(LINK_KEY, []);
  return links.find((l) => l.reportId === reportId)?.cardId ?? null;
}
