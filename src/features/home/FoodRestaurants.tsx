//   TODO: 3-5 구현 시 공용 상태(context/store)로 옮길 것
// - TODO: MOCK_ALLERGIES/MOCK_CARES는 실제 로그인 사용자 프로필로 교체해야함
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { SectionHeader } from "../../components/SectionHeader";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import { FOODS, RESTS } from "../../constants/mockFoodData";
import { MOCK_ALLERGIES, MOCK_CARES } from "../../constants/mockUserProfile";
import { CARE_NOTES, type Care } from "../../constants/diseaseCareMap";
import { judge, judgeRest } from "../../utils/seal";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

export function FoodRestaurants() {
  const navigate = useNavigate();
  const { foodId } = useParams<{ foodId: string }>();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();
  const [checkedTips, setCheckedTips] = useState<string[]>([]);

  const food = FOODS.find((f) => f.id === foodId);

  function goBackToList() {
    navigate("/home/foods");
  }

  function toggleTip(tip: string) {
    setCheckedTips((prev) =>
      prev.includes(tip) ? prev.filter((t) => t !== tip) : [...prev, tip],
    );
  }

  if (!food) {
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

  const allergenHits = food.allergens.filter((a) => MOCK_ALLERGIES.includes(a));
  const kind = judge(food.allergens, food.cares, MOCK_ALLERGIES, MOCK_CARES);
  const whys = food.cares.filter((c) => MOCK_CARES.includes(c));
  const rests = RESTS.filter((r) => r.foods.includes(food.id));

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
      <h1 className="mt-[10px] text-[1.875rem] font-bold">지역 음식</h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{ background: STROKE_GRADIENT }}
      />

      <div className="mt-[16px] flex items-start gap-[14px]">
        <Seal kind={kind} size={42} />
        <div className="flex-1">
          <div className="text-[1.625rem] font-bold leading-[1.2]">
            {food.name}
          </div>
          <div className="mt-[4px] text-xs">{food.region} 지역 음식</div>
        </div>
      </div>
      <p className="mt-[16px] text-[0.9375rem] leading-[1.72]">{food.desc}</p>

      {allergenHits.length > 0 && (
        <div className="mt-[20px] border-l-4 border-[#a6301f] bg-[#a6301f]/[0.09] px-[16px] py-[14px]">
          <div className="text-[0.84375rem] font-bold text-[#7d2114]">
            내 알레르기 재료가 들어갑니다
          </div>
          <div className="mt-[4px] text-[0.84375rem] text-[#7d2114]">
            {allergenHits.join(" · ")} — 다른 메뉴를 고르거나 빼 달라고
            요청하세요.
          </div>
        </div>
      )}

      {whys.length > 0 && (
        <>
          <SectionHeader title="무엇이 걸리는지" />
          <div className="flex flex-col gap-[12px]">
            {whys.map((c) => (
              <div key={c} className="flex items-baseline gap-[12px]">
                <span className="min-w-[84px] flex-none border-b-2 border-ink pb-[2px] text-[0.9375rem] font-bold">
                  {c}
                </span>
                <span className="flex-1 text-[0.84375rem]">
                  {CARE_NOTES[c as Care] ?? ""}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionHeader title="이렇게 주문하면 됩니다" />
      <div className="flex flex-col">
        {food.tips.map((tip) => {
          const on = checkedTips.includes(tip);
          return (
            <button
              key={tip}
              type="button"
              onClick={() => toggleTip(tip)}
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
              <span className="text-[0.96875rem]">{tip}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-[10px] text-xs">
        고른 요청은 주문 요청 카드에 담깁니다.
      </p>

      <SectionHeader title="이 음식 파는 곳" />
      <div className="flex flex-col pb-[10px]">
        {rests.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => navigate(`/restaurants/${r.id}`)}
            className="flex w-full items-center gap-[12px] border-0 bg-transparent px-[2px] py-[13px] text-left transition-colors hover:bg-ink/[0.045]"
          >
            <Seal kind={judgeRest(r.menus, MOCK_ALLERGIES, MOCK_CARES)} />
            <span className="flex-1">
              <span className="block text-[1.125rem] font-bold">{r.name}</span>
              <span className="mt-[3px] block text-xs">
                {r.area} · {r.dist}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
