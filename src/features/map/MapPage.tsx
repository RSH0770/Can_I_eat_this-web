// TODO: 반경 필터·편의도 점수·공공데이터 표시는 실제 공공데이터/백엔드 연동 시점에 별도로 다시 설계해서 추가하기
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { SectionHeader } from "../../components/SectionHeader";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import { RESTS, type RestItem } from "../../constants/mockFoodData";
import { FILTERS, FILTER_LABELS } from "../../constants/mapFilters";
import { MOCK_ALLERGIES, MOCK_CARES } from "../../constants/mockUserProfile";
import { judgeRest, SEAL_INFO } from "../../utils/seal";
import { KakaoRestaurantMap, type MapMarkerData } from "./KakaoRestaurantMap";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

const PER_PAGE = 3;

// 결과가 하나도 없을 때(검색/필터가 너무 좁혀졌을 때) 지도를 어디에 띄울지 — 강릉시청 근방을 기본 중심으로 둠
const DEFAULT_CENTER = { lat: 37.7519, lng: 128.8761 };

function computeCenter(points: { lat: number; lng: number }[]) {
  if (points.length === 0) return DEFAULT_CENTER;
  const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  return { lat, lng };
}

function restKind(r: RestItem) {
  return judgeRest(r.menus, MOCK_ALLERGIES, MOCK_CARES);
}

export function MapPage() {
  const navigate = useNavigate();
  const { increase, decrease, canIncrease, canDecrease, scale } =
    useFontScale();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [mapFull, setMapFull] = useState(false);

  function openRestaurant(id: string) {
    navigate(`/restaurants/${id}`);
  }

  function toggleFilter(f: string) {
    setPageIndex(0);
    setFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : prev.concat([f]),
    );
  }

  function onQueryChange(v: string) {
    setPageIndex(0);
    setQuery(v);
  }

  const q = query.trim();
  const filteredResults = RESTS.filter((r) => {
    const matchesQuery =
      !q || r.name.includes(q) || r.menus.some((m) => m.name.includes(q));
    return matchesQuery && filters.every((f) => r.flags.includes(f));
  });

  const pages = Math.max(1, Math.ceil(filteredResults.length / PER_PAGE));
  const page = Math.min(pageIndex, pages - 1);
  const pageResults = filteredResults.slice(
    page * PER_PAGE,
    page * PER_PAGE + PER_PAGE,
  );
  const noResults = filteredResults.length === 0;
  const hasPages = pages > 1;

  const markerData: MapMarkerData[] = filteredResults.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    kind: restKind(r),
  }));
  const mapCenter = computeCenter(markerData);

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
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="식당·음식 이름으로 찾기"
          className="min-w-0 flex-1 border-0 bg-transparent py-[4px] text-[1rem] text-ink outline-none placeholder:text-ink/40"
        />
        <span className="flex-none text-xs">{filteredResults.length}곳</span>
      </div>

      {/* 필터 칩 */}
      <div className="mt-[12px] flex flex-wrap gap-[6px]">
        {FILTERS.map((f) => {
          const on = filters.includes(f);
          return (
            <button
              key={f}
              type="button"
              onClick={() => toggleFilter(f)}
              className={`rounded-[3px] border-[1.5px] px-[9px] py-[6px] text-[0.84375rem] font-bold ${
                on
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/30 bg-transparent text-ink"
              }`}
            >
              {FILTER_LABELS[f] ?? f}
            </button>
          );
        })}
      </div>

      {/* 결과 리스트 */}
      <div className="mt-[16px] flex flex-col">
        {pageResults.map((r) => {
          const kind = restKind(r);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => openRestaurant(r.id)}
              className="flex w-full flex-col border-0 bg-transparent px-[2px] py-[13px] text-left transition-colors hover:bg-ink/[0.045]"
            >
              <span className="flex items-center gap-[12px]">
                <Seal kind={kind} />
                <span className="flex-1">
                  <span className="block text-[1.125rem] font-bold">
                    {r.name}
                  </span>
                  <span className="mt-[3px] block text-xs">
                    {r.area} · {r.dist}
                  </span>
                </span>
                <span className="flex-none text-xs">
                  {SEAL_INFO[kind].label}
                </span>
              </span>
              {r.flags.length > 0 && (
                <span className="mt-[8px] flex flex-wrap gap-[10px]">
                  {r.flags.map((f) => (
                    <span key={f} className="text-xs">
                      · {f}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {hasPages && (
        <div className="mt-[12px] flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
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
            onClick={() => setPageIndex((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1}
            className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음 〉
          </button>
        </div>
      )}
      {noResults && (
        <p className="mt-[14px] text-[0.84375rem]">
          조건에 맞는 식당이 없습니다. 조건을 줄여 보세요.
        </p>
      )}

      {/* 지도로 보기 — 실제 카카오맵 인라인 미리보기 */}
      <SectionHeader title="지도로 보기" />
      <div className="border border-ink/[0.22]">
        <KakaoRestaurantMap
          markers={markerData}
          center={mapCenter}
          height={232 * scale}
          level={8}
          onMarkerClick={openRestaurant}
          onMapClick={() => setMapFull(true)}
        />
      </div>

      <div className="h-[10px]" />

      {/* 전체화면 지도 — 탭바까지 덮는 오버레이 */}
      {mapFull && (
        <div className="fixed inset-0 z-50">
          <KakaoRestaurantMap
            markers={markerData}
            center={mapCenter}
            height="100%"
            level={7}
            big
            onMarkerClick={(id) => {
              setMapFull(false);
              openRestaurant(id);
            }}
          />
          <div className="pointer-events-none absolute left-[22px] right-[22px] top-[58px] flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => setMapFull(false)}
              className="pointer-events-auto cursor-pointer rounded-[3px] border-0 bg-ink px-[16px] py-[10px] text-[0.9375rem] font-bold text-cream"
            >
              〈 목록
            </button>
            <span className="pointer-events-auto border border-ink/20 bg-[rgba(233,231,226,.9)] px-[12px] py-[8px] text-xs">
              {filteredResults.length}곳
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
