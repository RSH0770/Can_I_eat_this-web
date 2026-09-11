// TODO: MOCK_ALLERGEIES/MOCK_CARES는 실제 로그인 사용자 프로필로 교체 예정
import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import { FOODS } from "../../constants/mockFoodData";
import { MOCK_ALLERGIES, MOCK_CARES } from "../../constants/mockUserProfile";
import { judge } from "../../utils/seal";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

function summaryFor(allergenHits: string[], careHits: string[]) {
  if (allergenHits.length) {
    return allergenHits.length > 1
      ? `${allergenHits[0]} 외 ${allergenHits.length - 1} 있음`
      : `${allergenHits[0]} 있음`;
  }
  if (careHits.length) {
    return careHits.length > 1
      ? `${careHits[0]} 외 ${careHits.length - 1} 조절 필요`
      : `${careHits[0]} 조절 필요`;
  }
  return "조절 불필요";
}

export function FoodList() {
  const navigate = useNavigate();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();

  const rows = FOODS.map((food) => {
    const allergenHits = food.allergens.filter((a) =>
      MOCK_ALLERGIES.includes(a),
    );
    const careHits = food.cares.filter((c) => MOCK_CARES.includes(c));
    return {
      food,
      kind: judge(food.allergens, food.cares, MOCK_ALLERGIES, MOCK_CARES),
      summary: summaryFor(allergenHits, careHits),
    };
  });

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
      <h1 className="mt-[10px] text-[1.875rem] font-bold">강릉 지역 음식</h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{ background: STROKE_GRADIENT }}
      />

      <p className="mb-[10px] mt-[16px] text-[0.84375rem] leading-[1.7]">
        눌러 보면 무엇이 걸리는지, 어떻게 주문하면 되는지 나옵니다.
      </p>

      <div className="flex flex-col">
        {rows.map(({ food, kind, summary }) => (
          <button
            key={food.id}
            type="button"
            onClick={() => navigate(`/home/foods/${food.id}`)}
            className="flex w-full items-center gap-[12px] border-0 bg-transparent px-[2px] py-[13px] text-left transition-colors hover:bg-ink/[0.045]"
          >
            <Seal kind={kind} />
            <span className="flex-1 text-[1.125rem] font-bold">
              {food.name}
            </span>
            <span className="max-w-[44%] flex-none text-right text-[0.84375rem]">
              {summary}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
