// MapPage.tsx
// GET /api/restaurants 연동 — 브라우저 위치(lat/lng) 기준으로 반경 검색해서 목록 + 지도에 뿌림
// 검색창(query)은 서버 q 파라미터로 그대로 위임 — 식당명 기준으로 확인됨

// TODO: 반경 설정 UI, 편의도 점수, 공공데이터 표시는 별도로 다시 설계해서 추가하기
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { SectionHeader } from "../../components/SectionHeader";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import type { SealKind } from "../../utils/seal";
import type { ApiSeal } from "../restaurant/types";
import { KakaoRestaurantMap, type MapMarkerData } from "./KakaoRestaurantMap";
import { useRestaurantSearch } from "./useRestaurantSearch";
import { createPortal } from "react-dom";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

const PAGE_SIZE = 3;
const SEARCH_DEBOUNCE_MS = 400;

// 결과가 하나도 없을 때(위치 미확보 등) 지도를 어디에 띄울지 — 강릉시청 근방을 기본 중심으로 둠
const DEFAULT_CENTER = { lat: 37.7519, lng: 128.8761 };

function computeCenter(points: { lat: number; lng: number }[]) {
  if (points.length === 0) return DEFAULT_CENTER;
  const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  return { lat, lng };
}

// 식당 상세(RestaurantDetail.tsx)와 동일한 "미태깅/비로그인 → ?" 표시. seal이 null일 수
// 있는 화면마다 반복되는데, 아직 두 화면뿐이라 공용 컴포넌트로 올리지 않고 그대로 둔다.
function SealOrUnknown({
  seal,
  size,
}: {
  seal: ApiSeal | null;
  size?: number;
}) {
  if (seal)
    return <Seal kind={seal.verdict.toLowerCase() as SealKind} size={size} />;
  const s = size ?? 34;
  return (
    <span
      aria-label="아직 판정되지 않았습니다"
      title="아직 판정되지 않았습니다"
      className="flex flex-none items-center justify-center rounded-[3px] border-[1.5px] border-ink/30 bg-transparent font-bold leading-none text-ink/40"
      style={{ width: s, height: s, fontSize: Math.round(s * 0.52) }}
    >
      ?
    </span>
  );
}

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

export function MapPage() {
  const navigate = useNavigate();
  const { increase, decrease, canIncrease, canDecrease, scale } =
    useFontScale();

  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [mapFull, setMapFull] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  // 타이핑마다 서버에 요청을 보내지 않도록 짧게 디바운스한 뒤에만 실제 검색어(query)를 갱신
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(queryInput.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [queryInput]);

  const searchState = useRestaurantSearch(query, page, PAGE_SIZE);

  function openRestaurant(id: number | string) {
    navigate(`/restaurants/${id}`);
  }

  const items = searchState.status === "ready" ? searchState.result.items : [];
  const totalCount =
    searchState.status === "ready" ? searchState.result.totalCount : 0;
  const pages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasPages = searchState.status === "ready" && pages > 1;
  const noResults = searchState.status === "ready" && totalCount === 0;

  const markerData: MapMarkerData[] = items.map((item) => ({
    id: String(item.id),
    lat: item.lat,
    lng: item.lng,
    kind: item.seal ? (item.seal.verdict.toLowerCase() as SealKind) : "unknown",
  }));
  const mapCenter = searchState.coords ?? computeCenter(markerData);

  return (
    <div
      className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[10px] pt-[58px] text-ink`}
    >
      {/* 상단바 — 탭 루트 화면이라 뒤로가기 없음, 스테퍼만 오른쪽 정렬 */}
      <div className="flex min-h-[34px] items-center">
        <div className="flex-1" />
        <FontSizeController
          onIncrease={increase}
          onDecrease={decrease}
          canIncrease={canIncrease}
          canDecrease={canDecrease}
        />
      </div>
      <h1 className="mt-[10px] text-[1.875rem] font-bold">지도</h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{ background: STROKE_GRADIENT }}
      />

      {/* 검색창 */}
      <div className="mt-[16px] flex items-center gap-[8px] border-b-2 border-ink pb-[6px]">
        <input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="식당 이름으로 찾기"
          className="min-w-0 flex-1 border-0 bg-transparent py-[4px] text-[1rem] text-ink outline-none placeholder:text-ink/40"
        />
        {searchState.status === "ready" && (
          <span className="flex-none text-xs">{totalCount}곳</span>
        )}
      </div>

      {/* 위치/조회 상태 */}
      {searchState.status === "locating" && (
        <p className="mt-[16px] text-[0.9375rem]">현재 위치를 확인하는 중...</p>
      )}

      {searchState.status === "location-error" && (
        <div className="mt-[16px]">
          <p className="text-[0.9375rem] text-[#a6301f]">
            {searchState.message}
          </p>
          <button
            type="button"
            onClick={searchState.retryLocation}
            className="mt-[14px] border-[1.5px] border-ink bg-transparent px-[16px] py-[10px] text-[0.9375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
          >
            다시 시도
          </button>
        </div>
      )}

      {searchState.status === "loading" && (
        <p className="mt-[16px] text-[0.9375rem]">식당을 찾는 중...</p>
      )}

      {searchState.status === "error" && (
        <div className="mt-[16px]">
          <p className="text-[0.9375rem] text-[#a6301f]">
            {searchState.message}
          </p>
          <button
            type="button"
            onClick={searchState.retry}
            className="mt-[14px] border-[1.5px] border-ink bg-transparent px-[16px] py-[10px] text-[0.9375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 결과 리스트 */}
      {searchState.status === "ready" && (
        <div className="mt-[16px] flex flex-col">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openRestaurant(item.id)}
              className="flex w-full flex-col border-0 bg-transparent px-[2px] py-[13px] text-left transition-colors hover:bg-ink/[0.045]"
            >
              <span className="flex items-center gap-[12px]">
                <SealOrUnknown seal={item.seal} />
                <span className="flex-1">
                  <span className="block text-[1.125rem] font-bold">
                    {item.name}
                  </span>
                  <span className="mt-[3px] block text-xs">{item.meta}</span>
                  <span className="mt-[2px] block text-xs text-ink/60">
                    {formatDistance(item.distanceM)} · 도보 {item.walkMinutes}분
                  </span>
                </span>
                <span className="flex-none text-xs">
                  {item.seal?.label ?? "판정 대기"}
                </span>
              </span>
              {item.flags.length > 0 && (
                <span className="mt-[8px] flex flex-wrap gap-[10px]">
                  {item.flags.map((f) => (
                    <span key={f} className="text-xs">
                      · {f}
                    </span>
                  ))}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {hasPages && (
        <div className="mt-[12px] flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
            className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            〈 이전
          </button>
          <span className="flex-1 text-center text-[0.84375rem] font-bold">
            {pages}쪽 중 {page + 1}쪽
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1}
            className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음 〉
          </button>
        </div>
      )}
      {noResults && (
        <p className="mt-[14px] text-[0.84375rem]">
          조건에 맞는 식당이 없습니다. 검색어를 줄여 보세요.
        </p>
      )}

      {/* 지도로 보기 — 실제 카카오맵 인라인 미리보기 */}
      <SectionHeader title="지도로 보기" />
      <div className="border border-ink/[0.22]">
        <KakaoRestaurantMap
          markers={markerData}
          center={mapCenter}
          myLocation={searchState.coords}
          height={232 * scale}
          level={8}
          onMarkerClick={openRestaurant}
          onMapClick={() => setMapFull(true)}
        />
      </div>

      <div className="h-[10px]" />

      {/* 전체화면 지도 — 탭바까지 덮는 오버레이 */}
      {mapFull &&
        createPortal(
          <div className="absolute inset-0 z-50">
            <KakaoRestaurantMap
              markers={markerData}
              center={mapCenter}
              myLocation={searchState.coords}
              height="100%"
              level={7}
              big
              resetToken={resetToken}
              onMarkerClick={(id) => {
                setMapFull(false);
                openRestaurant(id);
              }}
            />
            <div className="pointer-events-none absolute left-[20px] right-[20px] top-[18px] z-20 flex items-center gap-[10px]">
              <button
                type="button"
                onClick={() => setMapFull(false)}
                className="pointer-events-auto cursor-pointer rounded-[3px] border-0 bg-ink px-[16px] py-[10px] text-[0.9375rem] font-bold text-cream"
              >
                〈 목록
              </button>
              <span className="pointer-events-auto border border-ink/20 bg-[rgba(233,231,226,.9)] px-[12px] py-[8px] text-xs">
                {totalCount}곳
              </span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setResetToken((t) => t + 1)}
                className="pointer-events-auto cursor-pointer rounded-[3px] border border-ink/20 bg-[rgba(233,231,226,.9)] px-[12px] py-[8px] text-xs font-bold text-ink"
              >
                처음 위치
              </button>
            </div>
            <div className="pointer-events-none absolute bottom-[18px] left-[20px] z-20">
              <span className="pointer-events-auto border border-ink/20 bg-[rgba(233,231,226,.9)] px-[12px] py-[8px] text-xs text-ink/70">
                끌어서 이동
              </span>
            </div>
          </div>,
          document.getElementById("phone-frame") ?? document.body,
        )}
    </div>
  );
}
