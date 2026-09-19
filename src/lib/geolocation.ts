export type Coords = { lat: number; lng: number };
export type LocateResult =
  | { kind: "ok"; coords: Coords }
  | { kind: "denied" | "unavailable" | "timeout" };

// 위치를 기다리는 최대 시간. 권한 팝업에 응답하지 않으면 geolocation의
// timeout 옵션은 시작조차 하지 않아 영원히 기다리게 된다 → 앱이 직접 잰다.
const LOCATE_LIMIT_MS = 8_000;

export async function locate(): Promise<LocateResult> {
  if (!("geolocation" in navigator)) return { kind: "unavailable" };

  // 이미 거부된 상태면 기다리지 않고 바로 실패 처리
  try {
    const status = await navigator.permissions?.query({
      name: "geolocation" as PermissionName,
    });
    if (status?.state === "denied") return { kind: "denied" };
  } catch {
    // 일부 Safari는 permissions API가 없다. 그냥 진행한다.
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = (r: LocateResult): void => {
      if (settled) return; // 늦게 도착한 위치는 무시
      settled = true;
      clearTimeout(timer);
      resolve(r);
    };
    const timer = setTimeout(() => done({ kind: "timeout" }), LOCATE_LIMIT_MS);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        done({
          kind: "ok",
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      (err) =>
        done({
          kind: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
        }),
      {
        enableHighAccuracy: false,
        timeout: LOCATE_LIMIT_MS,
        maximumAge: 5 * 60_000,
      },
    );
  });
}
