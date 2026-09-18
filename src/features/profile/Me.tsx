import { FontSizeController } from "../../components/FontSizeController";
import { SectionHeader } from "../../components/SectionHeader";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import AppLogo from "../../assets/AppLogo.png";
import { useProfile } from "./useProfile";
import { useMyReports } from "./useMyReports";
import { Seal } from "../../components/Seal";
import type { ProfileResponse } from "./types";
import { useNavigate } from "react-router-dom";
import { getLinkedCardId } from "../../lib/orderCardLinks";

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

function Chip({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <span
      className={
        danger
          ? "border border-[#a6301f] bg-[#a6301f] px-[9px] py-[4px] text-[0.9375rem] text-white"
          : "border border-ink px-[9px] py-[4px] text-[0.9375rem] text-ink"
      }
    >
      {label}
    </span>
  );
}

function ProfileView({
  profile,
  reportsState,
}: {
  profile: ProfileResponse;
  reportsState: ReturnType<typeof useMyReports>;
}) {
  const navigate = useNavigate();
  const metaParts = [
    profile.birthYear ? `${profile.birthYear}년생` : "",
    profile.bloodType ?? "",
    profile.diseases.join("·"),
  ].filter(Boolean);
  const profileMeta = metaParts.join(" · ");
  const allergyText = profile.allergies.length
    ? `${profile.allergies.join(" · ")} 알레르기가 있습니다`
    : "";

  return (
    <>
      <div className="mt-[18px] flex items-start gap-[14px] border-b-[3px] border-ink pb-[18px]">
        <div className="flex-1">
          <div className="text-[1.625rem] font-bold">{profile.name} 님</div>
          <div className="mt-[5px] text-xs">{profileMeta}</div>
          {/* TODO: 프로필 수정(PUT /api/me/profile) 화면이 생기면 button + onClick으로 교체 */}
          <span className="mt-[12px] inline-flex items-center gap-[6px] border-[1.5px] border-ink px-[12px] py-[6px] text-xs text-ink">
            질환·주의 성분·알레르기 고치기 〉
          </span>
        </div>
        <img src={AppLogo} alt="" className="h-[50px] w-auto flex-none" />
      </div>

      {allergyText && (
        <div className="relative mt-[18px] bg-ink p-[16px] text-cream">
          <div className="text-xs tracking-[.1em]">꼭 확인해 주세요</div>
          <div className="mt-[6px] text-[1.3125rem] font-bold leading-[1.4]">
            {allergyText}
          </div>
          <span className="absolute bottom-[14px] right-[14px] flex h-[30px] w-[30px] items-center justify-center bg-[#a6301f] text-[0.6875rem] font-bold text-white">
            ✕
          </span>
        </div>
      )}

      <SectionHeader title="질환" />
      {profile.diseases.length > 0 ? (
        <div className="flex flex-wrap gap-[7px]">
          {profile.diseases.map((d) => (
            <Chip key={d} label={d} />
          ))}
        </div>
      ) : (
        <p className="m-0 text-[0.9375rem]">고른 질환이 없습니다.</p>
      )}

      <SectionHeader title="주의하는 것" />
      {profile.cares.length > 0 ? (
        <div className="flex flex-wrap gap-[7px]">
          {profile.cares.map((c) => (
            <Chip
              key={c.value}
              label={c.auto ? `${c.value} · 자동` : c.value}
            />
          ))}
        </div>
      ) : (
        <p className="m-0 text-[0.9375rem]">고른 성분이 없습니다.</p>
      )}

      <SectionHeader title="알레르기" danger />
      {profile.allergies.length > 0 ? (
        <div className="flex flex-wrap gap-[7px]">
          {profile.allergies.map((a) => (
            <Chip key={a} label={a} danger />
          ))}
        </div>
      ) : (
        <p className="m-0 text-[0.9375rem]">고른 알레르기가 없습니다.</p>
      )}

      <SectionHeader title="내 기록" />
      {reportsState.status === "loading" && (
        <p className="m-0 text-[0.9375rem]">불러오는 중…</p>
      )}
      {reportsState.status === "error" && (
        <div>
          <p className="text-[0.9375rem] text-[#a6301f]">
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
        (reportsState.reviews.length === 0 ? (
          <p className="m-0 text-[0.9375rem]">
            아직 기록이 없습니다. 식당 화면에서 다녀왔어요를 누르면 여기에
            쌓입니다.
          </p>
        ) : (
          <div className="flex flex-col gap-[16px]">
            {reportsState.reviews.map((v) => (
              <div key={v.id} className="flex gap-[12px]">
                <Seal kind={v.ok ? "ok" : "red"} size={28} />
                <div className="flex-1">
                  <div className="flex items-center gap-[8px]">
                    <div className="flex-1 text-[0.84375rem] font-bold">
                      {v.restaurantName} · {v.date}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("이 기록을 삭제할까요?")) {
                          reportsState.deleteReport(v.id);
                        }
                      }}
                      className="flex-none border-0 bg-transparent p-0 text-xs text-ink/50 underline underline-offset-[3px]"
                    >
                      삭제
                    </button>
                  </div>
                  {v.note && (
                    <p className="m-0 mt-[6px] text-[0.84375rem] leading-[1.7]">
                      {v.note}
                    </p>
                  )}
                  {v.requests.length > 0 && (
                    <div className="mt-[6px] flex flex-wrap gap-[10px]">
                      {v.requests.map((r) => (
                        <span key={r} className="text-xs text-ink/70">
                          그때 요청: {r}
                        </span>
                      ))}
                    </div>
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
                  {getLinkedCardId(v.id) != null && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/order-card", {
                          state: { cardId: getLinkedCardId(v.id) },
                        })
                      }
                      className="mt-[8px] border-[1.5px] border-ink/30 bg-transparent px-[10px] py-[5px] text-xs font-bold text-ink"
                    >
                      그때 카드 다시보기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
    </>
  );
}

export function Me() {
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();
  const state = useProfile();
  const reportsState = useMyReports();

  return (
    <div
      className={`${SCREEN_ENTER} flex min-h-full flex-col px-[22px] pb-[26px] pt-[16px] text-ink`}
    >
      {/* 상단바 — 뒤로가기 없는 탭 화면(Home.tsx와 동일 패턴) */}
      <div className="flex min-h-[34px] items-center">
        <div className="flex-1" />
        <FontSizeController
          onIncrease={increase}
          onDecrease={decrease}
          canIncrease={canIncrease}
          canDecrease={canDecrease}
        />
      </div>
      <h1 className="mt-[10px] text-[1.5rem] font-bold tracking-[-0.01em]">
        프로필
      </h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{ background: STROKE_GRADIENT }}
      />

      {state.status === "loading" && (
        <p className="mt-[26px] text-[0.9375rem]">불러오는 중…</p>
      )}

      {state.status === "error" && (
        <div className="mt-[26px]">
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

      {state.status === "ready" && (
        <ProfileView profile={state.profile} reportsState={reportsState} />
      )}
    </div>
  );
}
