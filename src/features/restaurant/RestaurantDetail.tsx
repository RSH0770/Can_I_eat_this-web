// - TODO: 후기 목록은 지금 COMMUNITY_REVIEWS(커뮤니티 후기)만 보여준다. 원본은 여기에
//   로그인한 사용자 본인의 방문 기록("내 후기")도 합치는데, 3-7 내 기록 저장소가
//   생기면 그 목록을 reviews 배열 앞에 합쳐주면 된다.
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { SectionHeader } from "../../components/SectionHeader";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import { RESTS } from "../../constants/mockFoodData";
import { MOCK_ALLERGIES, MOCK_CARES } from "../../constants/mockUserProfile";
import { CARE_NOTES, type Care } from "../../constants/diseaseCareMap";
import { REQ_FOR } from "../../constants/careRequestMap";
import { COMMUNITY_REVIEWS } from "../../constants/mockCommunityReviews";
import { judge } from "../../utils/seal";
import { jo } from "../../utils/korean";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

export function RestaurantDetail() {
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  // 메뉴별 "이 메뉴에 필요한 요청" 체크 상태 — 디자인 원본처럼 이 화면 전체가
  // 공유하는 로컬 상태 하나로 관리한다 (특정 메뉴에 종속되지 않음).
  const [requests, setRequests] = useState<string[]>([]);

  function goBack() {
    navigate(-1);
  }

  function toggleRequest(label: string) {
    setRequests((prev) =>
      prev.includes(label)
        ? prev.filter((r) => r !== label)
        : prev.concat([label]),
    );
  }

  const rest = RESTS.find((r) => r.id === restaurantId);

  if (!rest) {
    // 잘못된 restaurantId로 직접 들어온 경우 — 디자인 원본에는 없는 경로라 최소한으로만 처리
    return (
      <div
        className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[10px] pt-[16px] text-ink`}
      >
        <button
          type="button"
          onClick={goBack}
          className="self-start border-0 bg-transparent p-0 text-[0.9375rem] text-ink"
        >
          〈 뒤로
        </button>
        <p className="mt-[16px] text-[0.9375rem]">
          식당 정보를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const verdict = rest.flags.includes("저염 요청 가능")
    ? "간을 약하게 요청할 수 있는 곳"
    : "간 조절은 확인 필요";
  const reviews = COMMUNITY_REVIEWS[rest.id] ?? [];

  const menuRows = rest.menus.map((m, i) => {
    const kind = judge(m.allergens, m.cares, MOCK_ALLERGIES, MOCK_CARES);
    const open = openMenuIndex === i;
    const careHit = m.cares.filter((c) => MOCK_CARES.includes(c));
    const allergenHit = m.allergens.filter((a) => MOCK_ALLERGIES.includes(a));

    const sug: string[] = [];
    allergenHit.forEach((a) => sug.push(jo(a, "은", "는") + " 빼 주세요"));
    careHit.forEach((c) =>
      (REQ_FOR[c as Care] ?? []).forEach((r) => {
        if (!sug.includes(r)) sug.push(r);
      }),
    );

    const detail = allergenHit.length
      ? jo(allergenHit.join(" · "), "이", "가") +
        " 들어갑니다. 빼 달라고 요청하거나 다른 메뉴를 고르세요."
      : careHit.length
        ? jo(careHit.join(" · "), "이", "가") +
          " 걸립니다. " +
          CARE_NOTES[careHit[0] as Care] +
          "."
        : "주의 성분과 알레르기 재료가 모두 없습니다. 그대로 주문할 수 있습니다.";

    return {
      name: m.name,
      price: m.price,
      kind,
      open,
      tags: [...m.allergens, ...careHit],
      detail,
      sug,
      toggle: () => setOpenMenuIndex((prev) => (prev === i ? null : i)),
      openCard: () => {
        const merged = sug.concat(requests.filter((r) => !sug.includes(r)));
        setRequests(merged);
        navigate(`/restaurants/${rest.id}/order-card`, {
          state: { cardMenu: `${rest.name} · ${m.name}`, requests: merged },
        });
      },
    };
  });

  return (
    <div
      className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[10px] pt-[16px] text-ink`}
    >
      {/* 상단바 — 다른 상세 화면들과 동일 패턴, 타이틀은 식당 이름이 아니라 디자인 원본 그대로 "식당" 고정 */}
      <div className="flex min-h-[34px] items-center">
        <button
          type="button"
          onClick={goBack}
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
      <h1 className="mt-[10px] text-[1.875rem] font-bold">식당</h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{ background: STROKE_GRADIENT }}
      />

      {/* 식당명 + 지역·거리 + 태그 */}
      <div className="mt-[16px] text-[1.625rem] font-bold leading-[1.2]">
        {rest.name}
      </div>
      <div className="mt-[5px] text-xs">
        {rest.area} · {rest.dist}
      </div>
      <div className="mt-[12px] flex flex-wrap gap-[10px]">
        {rest.flags.map((f) => (
          <span key={f} className="border-b border-ink/30 pb-[1px] text-xs">
            {f}
          </span>
        ))}
      </div>

      {/* 한줄 판정 */}
      <p className="m-0 mt-[18px] bg-ink/5 border-l-4 border-ink px-[16px] py-[14px] leading-[1.7]">
        {verdict}
      </p>

      {/* 메뉴 */}
      <SectionHeader title="메뉴" />
      <div className="flex flex-col">
        {menuRows.map((m) => (
          <div
            key={m.name}
            className={
              m.open ? "my-[4px] border-[1.5px] border-ink px-[12px]" : ""
            }
          >
            <button
              type="button"
              onClick={m.toggle}
              className="block w-full border-0 bg-transparent px-0 py-[13px] text-left text-ink"
            >
              <span className="flex items-center gap-[12px]">
                <Seal kind={m.kind} />
                <span className="flex-1">
                  <span className="block text-[1.125rem] font-bold">
                    {m.name}
                  </span>
                  <span className="mt-[3px] block text-xs">{m.price}</span>
                </span>
                <span className="text-xs opacity-80">
                  {m.open ? "접기" : "펼치기"}
                </span>
              </span>
              {m.open && (
                <span className="mt-[12px] block pl-[46px]">
                  <span className="block text-[0.84375rem] leading-[1.7]">
                    {m.detail}
                  </span>
                  {m.tags.length > 0 && (
                    <span className="mt-[8px] flex flex-wrap gap-[10px]">
                      {m.tags.map((t) => (
                        <span key={t} className="text-xs">
                          · {t}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              )}
            </button>

            {m.open && (
              <div className="px-[2px] pb-[14px] pt-[4px]">
                <div className="mb-[8px] text-xs tracking-[.08em] opacity-80">
                  이 메뉴에 필요한 요청
                </div>
                {m.sug.length > 0 ? (
                  <div className="flex flex-col">
                    {m.sug.map((label) => {
                      const on = requests.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleRequest(label)}
                          className="flex w-full items-center gap-[12px] border-0 bg-transparent px-0 py-[9px] text-left text-ink"
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
                          <span className="text-[0.96875rem]">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="m-0 text-[0.84375rem]">
                    따로 부탁할 것이 없습니다.
                  </p>
                )}
                <button
                  type="button"
                  onClick={m.openCard}
                  className="mt-[10px] w-full border-0 bg-ink p-[12px] text-[0.96875rem] font-bold text-cream"
                >
                  이 메뉴로 카드 만들기
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 후기 */}
      <SectionHeader title={`후기 ${reviews.length}개`} />
      <div className="flex flex-col gap-[16px]">
        {reviews.map((v, i) => (
          <div key={i} className="flex gap-[12px]">
            <Seal kind={v.ok ? "ok" : "red"} size={28} />
            <div className="flex-1">
              <div className="text-[0.84375rem] font-bold">
                {v.who}
                <span className="font-normal"> · {v.date}</span>
              </div>
              <p className="m-0 mt-[6px] text-[0.84375rem] leading-[1.7]">
                {v.note}
              </p>
              {v.feedback.length > 0 && (
                <div className="mt-[6px] flex flex-wrap gap-[10px]">
                  {v.feedback.map((f) => (
                    <span key={f} className="text-xs">
                      · {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 액션 */}
      <div className="mb-[10px] mt-[26px] flex flex-col gap-[10px]">
        <button
          type="button"
          onClick={() =>
            navigate(`/restaurants/${rest.id}/order-card`, {
              state: { cardMenu: rest.name, requests },
            })
          }
          className="cursor-pointer rounded-[3px] border-0 bg-ink p-[14px] text-[1.03125rem] font-bold text-cream"
        >
          주문 요청 카드 보여주기
        </button>
        <button
          type="button"
          // TODO: 3-7 내 기록과 엮이는 후기 작성 폼 — 디자인 원본도 addLog: () => {} 로
          // 빈 스텁이라 여기서도 동작 없이 자리만 잡아둔다.
          onClick={() => {}}
          className="cursor-pointer rounded-[3px] border-[1.5px] border-ink bg-transparent p-[12px] text-[0.96875rem] text-ink"
        >
          다녀왔어요 · 후기 남기기
        </button>
      </div>
    </div>
  );
}
