import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import AppLogo from "../../assets/AppLogo.png";
import { useProfile } from "../profile/useProfile";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useRegionalFoods } from "./useRegionalFoods";

const REGION_FOOD_TITLE = "지역 음식";

export function Home() {
  const navigate = useNavigate();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();
  const state = useProfile();
  const geo = useGeolocation();
  const foodsState = useRegionalFoods(
    geo.status === "ready" ? geo.coords : null,
  );

  const regionLabel =
    foodsState.status === "ready" ? foodsState.result.region : null;
  const foodPreviewText =
    foodsState.status === "ready" && foodsState.result.items.length > 0
      ? `${foodsState.result.items.length}가지 지역 음식이 있어요`
      : "여행지에 맞는 음식을 모아드려요";

  function handleOpenCard() {
    // TODO: 주문 요청 카드 진입
    navigate("/order-card");
  }

  function handleGoFoodList() {
    navigate("/home/foods");
  }

  return (
    <div
      className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pt-[16px] pb-[10px] text-ink`}
    >
      {/* 글자 크기 조절 */}
      <div className="flex min-h-[34px] items-center">
        <div className="flex-1" />
        <FontSizeController
          onIncrease={increase}
          onDecrease={decrease}
          canIncrease={canIncrease}
          canDecrease={canDecrease}
        />
      </div>

      {/* 타이틀 */}
      <h1 className="text-[1.875rem] font-bold">
        {regionLabel ? `${regionLabel} · 여행 중` : "여행 중"}
      </h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{
          background:
            "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)",
        }}
      />

      {state.status === "loading" && (
        <p className="mt-[16px] text-[0.9375rem]">불러오는 중...</p>
      )}

      {state.status === "error" && (
        <div className="mt-[16px]">
          <p className="text-[0.9375rem] text-[#a6301f]">{state.message}</p>
          <button
            type="button"
            onClick={state.reload}
            className="mt-[14px] border-[1.5px] border-ink bg-transparent px-[16px] py-[10px] text-[0.9375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 인사말 */}
      {state.status === "ready" && (
        <>
          {/* 인사말 */}
          <div className="flex items-start mt-[12px] gap-[14px]">
            <div className="flex-1">
              <h2 className="text-[1.3125rem] font-bold leading-[1.3]">
                {state.profile.name} 님,
                <br />
                오늘은 무엇을 드시나요?
              </h2>
            </div>
            {/* 앱 로고 */}
            <img src={AppLogo} alt="먹어도 돼?" className="h-[54px] w-auto" />
          </div>

          {/* 버튼 2개 */}
          <div className="mt-[18px] flex flex-1 flex-col gap-[12px]">
            <button
              type="button"
              onClick={handleOpenCard}
              className="flex w-full flex-[3] flex-col border-0 bg-ink p-[20px] text-left text-cream"
            >
              <span className="text-xs tracking-[.1em] opacity-80">
                서찰 · 그대로 보여주기
              </span>
              <span className="mt-[10px] text-[2.125rem] font-bold leading-[1.15]">
                주문 요청
                <br />
                카드
              </span>
              <span className="flex-1" />
              <span className="border-t border-cream/30 pt-[14px] text-[0.84375rem]">
                {state.profile.allergies.length > 0
                  ? `${state.profile.allergies.join(" · ")} · 요청 ${state.profile.allergies.length}개`
                  : `요청 사항을 확인해요`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleGoFoodList}
              className="flex w-full flex-[2] flex-col border-[1.5px] border-ink bg-transparent p-[20px] text-left text-ink transition-colors hover:bg-ink/[0.06]"
            >
              <span className="text-xs tracking-[.1em] opacity-80">
                무엇을 먹을지
              </span>
              <span className="mt-[8px] text-[1.625rem] font-bold">
                {REGION_FOOD_TITLE}
              </span>
              <span className="flex-1" />
              <span className="border-t border-ink/20 pt-[12px] text-[0.84375rem]">
                {foodPreviewText}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
