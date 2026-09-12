// MapPage.tsx의 인라인 미리보기 지도 / 전체화면 지도가 공유하는 실제 카카오맵 컴포넌트
import { useEffect, useRef } from "react";
import { SEAL_INFO, type SealKind } from "../../utils/seal";
import { useKakaoMapsSdk } from "../../hooks/useKakaoMapSdk";

const SEAL_TONE: Record<SealKind, { bg: string; fg: string; border: string }> =
  {
    red: { bg: "#a6301f", fg: "#fff", border: "#a6301f" },
    ink: { bg: "#f1efea", fg: "#1a1815", border: "#1a1815" },
    ok: { bg: "#1a1815", fg: "#e9e7e2", border: "#1a1815" },
  };

export type MapMarkerData = {
  id: string;
  lat: number;
  lng: number;
  kind: SealKind;
};

function createMarkerElement(
  kind: SealKind,
  big: boolean,
  onClick: () => void,
) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = SEAL_INFO[kind].mark;
  el.setAttribute("aria-label", SEAL_INFO[kind].label);
  const tone = SEAL_TONE[kind];
  const size = big ? "52px" : "40px";
  Object.assign(el.style, {
    width: size,
    height: size,
    display: "grid",
    placeItems: "center",
    borderRadius: "3px",
    border: `2px solid ${tone.border}`,
    background: tone.bg,
    color: tone.fg,
    fontWeight: "700",
    fontSize: big ? "27px" : "21px",
    lineHeight: "1",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(26,24,21,.3)",
    font: "inherit",
    padding: "0",
  } as Partial<CSSStyleDeclaration> as Record<string, string>);
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return el;
}

type KakaoRestaurantMapProps = {
  markers: MapMarkerData[];
  center: { lat: number; lng: number };
  height: number | string;
  level?: number;
  big?: boolean;
  onMarkerClick: (id: string) => void;
  onMapClick?: () => void;
};

export function KakaoRestaurantMap({
  markers,
  center,
  height,
  level = 8,
  big = false,
  onMarkerClick,
  onMapClick,
}: KakaoRestaurantMapProps) {
  const status = useKakaoMapsSdk();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);

  // 지도 인스턴스는 SDK가 준비된 뒤 한 번만 생성한다. center/level의 이후 변경은 아래 별도 effect가 setCenter/setLevel로 반영하므로, 여기서는 최초 생성 시점의 값만 쓰고 status만 의존성으로 둠
  useEffect(() => {
    if (status !== "ready" || !containerRef.current || mapRef.current) return;
    const kakao = window.kakao;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    if (big) {
      map.addControl(
        new kakao.maps.ZoomControl(),
        kakao.maps.ControlPosition.RIGHT,
      );
    }
    mapRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 지도 인스턴스는 SDK 준비 시점에 1회만 생성
  }, [status]);

  // 이미 만들어진 지도 인스턴스에 중심/레벨 변경을 반영 (예: 검색/필터로 결과가 바뀌어 중심 좌표가 이동한 경우)
  useEffect(() => {
    if (!mapRef.current || status !== "ready") return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(center.lat, center.lng),
    );
    mapRef.current.setLevel(level);
  }, [status, center.lat, center.lng, level]);

  // 지도 "빈 공간" 탭 리스너 — 마커 클릭은 마커 엘리먼트 자체의 click에서 stopPropagation하므로 여기로 전파되지 않움
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !onMapClick) return;
    const kakao = window.kakao;
    const map = mapRef.current;
    const handler = () => onMapClick();
    kakao.maps.event.addListener(map, "click", handler);
    return () => {
      kakao.maps.event.removeListener(map, "click", handler);
    };
  }, [status, onMapClick]);

  // 마커(CustomOverlay) 동기화 — 매번 기존 마커를 전부 지우고 새로 올림
  // 식당 개수가 많지 않아(지금은 4곳) 성능 문제가 없어서 diff 없이 단순하게 처리
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const kakao = window.kakao;
    const map = mapRef.current;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = markers.map((m) => {
      const el = createMarkerElement(m.kind, big, () => onMarkerClick(m.id));
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(m.lat, m.lng),
        content: el,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 10,
      });
      overlay.setMap(map);
      return overlay;
    });

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onMarkerClick은 렌더마다 새로 만들어지는 함수라 의도적으로 제외
  }, [status, markers, big]);

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      {status !== "ready" && (
        <div
          className="flex h-full items-center justify-center px-[16px] text-center text-xs leading-[1.6] text-ink/60"
          style={{ background: "#e6e5de" }}
        >
          {status === "missing-key" && (
            <span>
              카카오맵 키가 설정되지 않았습니다.
              <br />
              .env.local에 VITE_KAKAO_MAP_KEY를 추가해 주세요.
            </span>
          )}
          {status === "loading" && <span>지도를 불러오는 중…</span>}
          {status === "error" && (
            <span>
              지도를 불러오지 못했습니다.
              <br />키 또는 도메인 등록을 확인해 주세요.
            </span>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: status === "ready" ? "block" : "none",
        }}
      />
    </div>
  );
}
