import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { SectionHeader } from "../../components/SectionHeader";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useFoodDetail } from "./useFoodDetail";
import type { SealKind } from "../../utils/seal";
import type { ApiSeal } from "./foodTypes";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

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

function formatDistance(m: number | null) {
  if (m == null) return "";
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

export function FoodRestaurants() {
  const navigate = useNavigate();
  const { foodId } = useParams<{ foodId: string }>();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();
  const [checkedTips, setCheckedTips] = useState<string[] | null>(null);

  const geo = useGeolocation();
  const detailState = useFoodDetail(
    foodId,
    geo.status === "ready" ? geo.coords : null,
  );

  function goBackToList() {
    navigate("/home/foods");
  }

  function toggleTip(tip: string, defaultSelected: string[]) {
    setCheckedTips((prev) => {
      const base = prev ?? defaultSelected;
      return base.includes(tip)
        ? base.filter((t) => t !== tip)
        : [...base, tip];
    });
  }

  if (!foodId) {
    return (
      <div
        className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[10px] pt-[16px] text-ink`}
      >
        <button
          type="button"
          onClick={goBackToList}
          className="self-start border-0 bg-transparent p-0 text-[0.9375rem] text-ink"
        >
          〈 뒤로
        </button>
        <p className="mt-[16px] text-[0.9375rem]">
          음식 정보를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[10px] pt-[16px] text-ink`}
    >
      <div className="flex min-h-[34px] items-center">
        <button
          type="button"
          onClick={goBackToList}
          className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink"
        >
          〈 뒤로
        </button>
        <div className="flex-1" />
        <FontSizeController
          onIncrease={increase}
          onDecrease={decrease}
          canIncrease={canIncrease}
          canDecrease={canDecrease}
        />
      </div>
      <h1 className="mt-[10px] text-[1.875rem] font-bold">
        {detailState.status === "ready"
          ? detailState.result.regionLine
          : "지역 음식"}
      </h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{ background: STROKE_GRADIENT }}
      />

      {detailState.status === "loading" && (
        <p className="mt-[16px] text-[0.9375rem]">불러오는 중...</p>
      )}

      {detailState.status === "error" && (
        <div className="mt-[16px]">
          <p className="text-[0.9375rem] text-[#a6301f]">
            {detailState.message}
          </p>
          <button
            type="button"
            onClick={detailState.retry}
            className="mt-[14px] border-[1.5px] border-ink bg-transparent px-[16px] py-[10px] text-[0.9375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
          >
            다시 시도
          </button>
        </div>
      )}

      {detailState.status === "ready" &&
        (() => {
          const detail = detailState.result;
          const defaultSelectedTips = detail.tips
            .filter((t) => t.selected)
            .map((t) => t.phrase);
          const effectiveChecked = checkedTips ?? defaultSelectedTips;

          return (
            <>
              <div className="mt-[16px] flex items-start gap-[14px]">
                <SealOrUnknown seal={detail.seal} size={42} />
                <div className="flex-1">
                  <div className="text-[1.625rem] font-bold leading-[1.2]">
                    {detail.name}
                  </div>
                  <div className="mt-[4px] text-xs">{detail.regionLine}</div>
                </div>
              </div>
              <p className="mt-[16px] text-[0.9375rem] leading-[1.72]">
                {detail.description}
              </p>

              {detail.hasAllergen && detail.allergenText && (
                <div className="mt-[20px] border-l-4 border-[#a6301f] bg-[#a6301f]/[0.09] px-[16px] py-[14px]">
                  <div className="text-[0.84375rem] font-bold text-[#7d2114]">
                    내 알레르기 재료가 들어갑니다
                  </div>
                  <div className="mt-[4px] text-[0.84375rem] text-[#7d2114]">
                    {detail.allergenText}
                  </div>
                </div>
              )}

              {detail.careReasons.length > 0 && (
                <>
                  <SectionHeader title="무엇이 걸리는지" />
                  <div className="flex flex-col gap-[12px]">
                    {detail.careReasons.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-baseline gap-[12px]"
                      >
                        <span className="min-w-[84px] flex-none border-b-2 border-ink pb-[2px] text-[0.9375rem] font-bold">
                          {c.name}
                        </span>
                        <span className="flex-1 text-[0.84375rem]">
                          {c.note}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {detail.tips.length > 0 && (
                <>
                  <SectionHeader title="이렇게 주문하면 됩니다" />
                  <div className="flex flex-col">
                    {detail.tips.map((tip) => {
                      const on = effectiveChecked.includes(tip.phrase);
                      return (
                        <button
                          key={tip.phrase}
                          type="button"
                          onClick={() =>
                            toggleTip(tip.phrase, defaultSelectedTips)
                          }
                          className="flex w-full items-center gap-[12px] border-0 bg-transparent px-0 py-[11px] text-left text-ink"
                        >
                          <span
                            className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[2px] border-[1.5px] text-[0.75rem] ${
                              on
                                ? "border-ink bg-ink text-cream"
                                : "border-ink/30 bg-transparent text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="text-[0.96875rem]">
                            {tip.phrase}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-[10px] text-xs">
                    고른 요청은 주문 요청 카드에 담깁니다.
                  </p>
                </>
              )}

              <SectionHeader title="이 음식 파는 곳" />
              {detail.restaurantsUnavailable && (
                <p className="text-[0.84375rem] text-ink/60">
                  지금 식당 목록을 불러오지 못했어요. 잠시 후 다시 시도해
                  주세요.
                </p>
              )}
              {!detail.restaurantsUnavailable &&
                detail.restaurants.length === 0 && (
                  <p className="text-[0.84375rem] text-ink/60">
                    근처에서 이 음식을 파는 곳을 찾지 못했어요.
                  </p>
                )}
              <div className="flex flex-col pb-[10px]">
                {detail.restaurants.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => navigate(`/restaurants/${r.id}`)}
                    className="flex w-full items-center gap-[12px] border-0 bg-transparent px-[2px] py-[13px] text-left transition-colors hover:bg-ink/[0.045]"
                  >
                    <SealOrUnknown seal={r.seal} />
                    <span className="flex-1">
                      <span className="block text-[1.125rem] font-bold">
                        {r.name}
                      </span>
                      <span className="mt-[3px] block text-xs">
                        {r.meta}
                        {r.distanceM != null
                          ? ` · ${formatDistance(r.distanceM)}`
                          : ""}
                        {r.walkMinutes != null
                          ? ` · 도보 ${r.walkMinutes}분`
                          : ""}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          );
        })()}
    </div>
  );
}
