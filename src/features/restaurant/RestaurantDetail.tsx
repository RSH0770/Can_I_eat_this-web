import { useState, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { Seal } from "../../components/Seal";
import { SectionHeader } from "../../components/SectionHeader";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import { useRestaurantReports } from "./useRestaurantReports";
import type { SealKind } from "../../utils/seal";
import { useRestaurantDetail } from "./useRestaurantDetail";
import type { ApiSeal } from "./types";

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

function renderMultiline(text: string) {
  return text.split(/<br\s*\/?>/gi).map((line, i, arr) => (
    <Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </Fragment>
  ));
}

export function RestaurantDetail() {
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  // 메뉴별 "이 메뉴에 필요한 요청" 체크 상태 — 이 화면 전체가 공유하는 로컬 상태 하나로 관리.
  const [requests, setRequests] = useState<string[]>([]);

  const restaurantState = useRestaurantDetail(restaurantId);
  const reportsState = useRestaurantReports(restaurantId);

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

  return (
    <div
      className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[10px] pt-[16px] text-ink`}
    >
      {/* 상단바 */}
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

      {restaurantState.status === "loading" && (
        <p className="mt-[16px] text-[0.9375rem]">불러오는 중…</p>
      )}

      {restaurantState.status === "error" && (
        <div className="mt-[16px]">
          <p className="text-[0.9375rem] text-[#a6301f]">
            {restaurantState.message}
          </p>
          <button
            type="button"
            onClick={restaurantState.reload}
            className="mt-[14px] border-[1.5px] border-ink bg-transparent px-[16px] py-[10px] text-[0.9375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
          >
            다시 시도
          </button>
        </div>
      )}

      {restaurantState.status === "ready" &&
        (() => {
          const restaurant = restaurantState.restaurant;

          const menuRows = restaurant.menus.map((m, i) => {
            const open = openMenuIndex === i;
            const hitTags = [
              ...m.hitMainAllergens,
              ...m.hitTraceAllergens,
              ...m.hitCares,
            ];
            return {
              id: m.id,
              name: m.name,
              seal: m.seal,
              open,
              tags: hitTags,
              detail: m.detail,
              sug: m.suggestedRequests,
              toggle: () => setOpenMenuIndex((prev) => (prev === i ? null : i)),
              openCard: () => {
                navigate(`/restaurants/${restaurant.id}/order-card`, {
                  state: {
                    restaurantId: restaurant.id,
                    requests,
                    menuName: m.name,
                  },
                });
              },
            };
          });

          return (
            <>
              {/* 식당명 + 요약 + 태그 */}
              <div className="mt-[16px] flex items-start gap-[14px]">
                <SealOrUnknown seal={restaurant.seal} size={42} />
                <div className="flex-1">
                  <div className="text-[1.625rem] font-bold leading-[1.2]">
                    {restaurant.name}
                  </div>
                  <div className="mt-[5px] text-xs">
                    {restaurant.meta}
                    {restaurant.distanceM != null &&
                    restaurant.walkMinutes != null
                      ? ` · ${restaurant.distanceM}m · 도보 ${restaurant.walkMinutes}분`
                      : ""}
                  </div>
                </div>
              </div>
              <div className="mt-[12px] flex flex-wrap gap-[10px]">
                {restaurant.flags.map((f) => (
                  <span
                    key={f}
                    className="border-b border-ink/30 pb-[1px] text-xs"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* 한줄 판정 */}
              <p className="m-0 mt-[18px] border-l-4 border-ink bg-ink/5 px-[16px] py-[14px] leading-[1.7]">
                {restaurant.seal
                  ? restaurant.seal.label
                  : "아직 판정 정보가 없습니다."}
              </p>

              {/* 매장 정보 섹션 (전화 · 영업시간 · 휴무일 · 주차) */}
              {(restaurant.tel ||
                restaurant.openTime ||
                restaurant.restDate ||
                restaurant.parking) && (
                <section className="mt-[16px] rounded-[2px] border border-ink/30 bg-ink/[0.02] p-[16px]">
                  <h2 className="mb-[10px] text-[0.9375rem] font-semibold">
                    매장 정보
                  </h2>
                  <dl className="space-y-[6px] text-[0.875rem] text-ink/70">
                    {restaurant.openTime && (
                      <div className="flex gap-[8px]">
                        <dt className="w-[56px] shrink-0 text-ink/40">
                          영업시간
                        </dt>
                        <dd>{renderMultiline(restaurant.openTime)}</dd>
                      </div>
                    )}
                    {restaurant.restDate && (
                      <div className="flex gap-[8px]">
                        <dt className="w-[56px] shrink-0 text-ink/40">
                          휴무일
                        </dt>
                        <dd>{renderMultiline(restaurant.restDate)}</dd>
                      </div>
                    )}
                    {restaurant.tel && (
                      <div className="flex gap-[8px]">
                        <dt className="w-[56px] shrink-0 text-ink/40">전화</dt>
                        <dd>
                          <a
                            href={`tel:${restaurant.tel}`}
                            className="underline"
                          >
                            {restaurant.tel}
                          </a>
                        </dd>
                      </div>
                    )}
                    {restaurant.parking && (
                      <div className="flex gap-[8px]">
                        <dt className="w-[56px] shrink-0 text-ink/40">주차</dt>
                        <dd>{restaurant.parking}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              {/* 메뉴 */}
              <SectionHeader title="메뉴" />
              <div className="flex flex-col">
                {menuRows.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.open
                        ? "my-[4px] border-[1.5px] border-ink px-[12px]"
                        : ""
                    }
                  >
                    <button
                      type="button"
                      onClick={m.toggle}
                      className="block w-full border-0 bg-transparent px-0 py-[13px] text-left text-ink"
                    >
                      <span className="flex items-center gap-[12px]">
                        <SealOrUnknown seal={m.seal} />
                        <span className="flex-1">
                          <span className="block text-[1.125rem] font-bold">
                            {m.name}
                          </span>
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
                                  <span className="text-[0.96875rem]">
                                    {label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="m-0 text-[0.84375rem]">
                            {m.seal
                              ? "따로 부탁할 것이 없습니다."
                              : "분석 전이라 요청을 제안할 수 없어요."}
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
              <SectionHeader
                title={
                  reportsState.status === "ready"
                    ? `후기 ${reportsState.data.count}개`
                    : "후기"
                }
              />
              {reportsState.status === "loading" && (
                <p className="text-[0.84375rem]">불러오는 중…</p>
              )}
              {reportsState.status === "error" && (
                <div>
                  <p className="text-[0.84375rem] text-[#a6301f]">
                    {reportsState.message}
                  </p>
                  <button
                    type="button"
                    onClick={reportsState.reload}
                    className="mt-[10px] border-[1.5px] border-ink bg-transparent px-[14px] py-[8px] text-[0.84375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {reportsState.status === "ready" &&
                (reportsState.data.reviews.length === 0 ? (
                  <p className="m-0 text-[0.84375rem]">아직 후기가 없습니다.</p>
                ) : (
                  <div className="flex flex-col gap-[16px]">
                    {reportsState.data.reviews.map((v) => (
                      <div key={v.id} className="flex gap-[12px]">
                        <Seal kind={v.ok ? "ok" : "red"} size={28} />
                        <div className="flex-1">
                          <div className="text-[0.84375rem] font-bold">
                            {v.author}
                            <span className="font-normal"> · {v.date}</span>
                            {v.mine && (
                              <span className="font-normal">
                                {" "}
                                · 내가 쓴 후기
                              </span>
                            )}
                          </div>
                          {v.note && (
                            <p className="m-0 mt-[6px] text-[0.84375rem] leading-[1.7]">
                              {v.note}
                            </p>
                          )}
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
                ))}

              <p className="mt-[14px] text-xs leading-[1.75] text-ink/80">
                {restaurant.disclaimer}
              </p>

              {/* 하단 액션 */}
              <div className="mb-[10px] mt-[26px] flex flex-col gap-[10px]">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/restaurants/${restaurant.id}/order-card`, {
                      state: { restaurantId: restaurant.id, requests },
                    })
                  }
                  className="cursor-pointer rounded-[3px] border-0 bg-ink p-[14px] text-[1.03125rem] font-bold text-cream"
                >
                  주문 요청 카드 보여주기
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/restaurants/${restaurant.id}/report`, {
                      state: { restaurantId: restaurant.id, requests },
                    })
                  }
                  className="cursor-pointer rounded-[3px] border-[1.5px] border-ink bg-transparent p-[12px] text-[0.96875rem] text-ink"
                >
                  다녀왔어요 · 후기 남기기
                </button>
              </div>
            </>
          );
        })()}
    </div>
  );
}
