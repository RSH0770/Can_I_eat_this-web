import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import AppLogo from "../../assets/AppLogo.png";

// TODO: 로그인한 사용자 이름으로 교체
const USER_NAME = "홍길동";

// TODO: 질환<->주의성분 매핑, 알레르기/요청 데이터 설계 완료 후 실제 프로필 상태로 교체
const ALLERGIES = ["새우", "고등어"];
const REQUEST_COUNT = 2;

const REGION_FOOD_TITLE = "강릉 지역 음식";

// TODO: 실제 지역 음식 데이터(FOODS)로 교체
const REGION_FOOD_PREVIEW_NAMES = ["초당 순두부", "감자 옹심이", "물회"];

export function Home() {
  const navigate = useNavigate();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();

  const allergyShort = ALLERGIES.length
    ? `${ALLERGIES.join(" · ")} · 요청 ${REQUEST_COUNT}개`
    : `요청 ${REQUEST_COUNT}개`;

  const foodNames = REGION_FOOD_PREVIEW_NAMES.map(
    (name) => name.split(" ").slice(-1)[0],
  ).join(" · ");

  function handleOpenCard() {
    // TODO: 주문 요청 카드 진입
    console.log("TODO: 주문 요청 카드 화면으로 이동");
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
      <h1 className="text-[1.875rem] font-bold">강릉 · 여행 중</h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{
          background:
            "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)",
        }}
      />

      {/* 인사말 */}
      <div className="flex items-start mt-[12px] gap-[14px]">
        <div className="flex-1">
          <h2 className="text-[1.3125rem] font-bold leading-[1.3]">
            {USER_NAME} 님,
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
            {allergyShort}
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
            {foodNames}
          </span>
        </button>
      </div>
    </div>
  );
}
