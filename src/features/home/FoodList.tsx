import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import { useAppLocation } from "../../context/LocationContext";
import { useRegionalFoods } from "./useRegionalFoods";
import type { SealKind } from "../../utils/seal";
import type { ApiSeal } from "./foodTypes";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

// 지도/식당 상세와 동일한 "미태깅/비로그인 → ?" 표시. 화면마다 조금씩 중복되는데 아직 공용 컴포넌트로 올릴 정도로 반복이 많지 않아 그대로 둠
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

export function FoodList() {
  const navigate = useNavigate();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();
  const { location, openPicker } = useAppLocation();
  const foodsState = useRegionalFoods(location?.coords ?? null);

  const regionTitle =
    location?.source === "manual"
      ? `${location.label} 지역 음식`
      : foodsState.status === "ready" && foodsState.result.region
        ? `${foodsState.result.region} 지역 음식`
        : "지역 음식";

  return (
    <div
      className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[10px] pt-[16px] text-ink`}
    >
      <div className="flex min-h-[34px] items-center">
        <button
          type="button"
          onClick={() => navigate("/home")}
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
      <h1 className="mt-[10px] text-[1.875rem] font-bold">{regionTitle}</h1>
      <button
        type="button"
        onClick={openPicker}
        className="mt-[4px] self-start border-0 bg-transparent p-0 text-xs text-ink/50"
      >
        지역 변경
      </button>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{ background: STROKE_GRADIENT }}
      />

      <p className="mb-[10px] mt-[16px] text-[0.84375rem] leading-[1.7]">
        눌러 보면 무엇이 걸리는지, 어떻게 주문하면 되는지 나옵니다.
      </p>

      {!location && (
        <p className="mt-[16px] text-[0.9375rem]">현재 위치를 확인하는 중...</p>
      )}

      {location && foodsState.status === "loading" && (
        <p className="mt-[16px] text-[0.9375rem]">지역 음식을 불러오는 중...</p>
      )}

      {location && foodsState.status === "error" && (
        <div className="mt-[16px]">
          <p className="text-[0.9375rem] text-[#a6301f]">
            {foodsState.message}
          </p>
          <button
            type="button"
            onClick={foodsState.retry}
            className="mt-[14px] border-[1.5px] border-ink bg-transparent px-[16px] py-[10px] text-[0.9375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
          >
            다시 시도
          </button>
        </div>
      )}

      {location &&
        foodsState.status === "ready" &&
        (foodsState.result.items.length === 0 ? (
          <p className="mt-[16px] text-[0.84375rem] leading-[1.7]">
            아직 이 지역의 음식 정보는 준비 중이에요.
          </p>
        ) : (
          <div className="flex flex-col">
            {foodsState.result.items.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => navigate(`/home/foods/${food.id}`)}
                className="flex w-full items-center gap-[12px] border-0 bg-transparent px-[2px] py-[13px] text-left transition-colors hover:bg-ink/[0.045]"
              >
                <SealOrUnknown seal={food.seal} />
                <span className="flex-1 text-[1.125rem] font-bold">
                  {food.name}
                </span>
                <span className="max-w-[44%] flex-none text-right text-[0.84375rem]">
                  {food.summary}
                </span>
              </button>
            ))}
          </div>
        ))}
    </div>
  );
}
