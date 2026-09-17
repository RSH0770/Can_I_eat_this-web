import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SectionHeader } from "../../components/SectionHeader";
import { SCREEN_ENTER } from "../../constants/animation";
import { useReportOptions } from "./useReportOptions";
import { useSubmitReport } from "./useSubmitReport";

type WriteReportNavState = {
  restaurantId?: number;
  requests?: string[];
};

export function WriteReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as WriteReportNavState | null) ?? null;

  if (navState?.restaurantId == null) {
    return (
      <div
        className={`${SCREEN_ENTER} flex h-full flex-col items-center justify-center gap-[14px] px-[22px] text-center text-ink`}
      >
        <p className="text-[0.9375rem]">잘못된 접근입니다.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="border-[1.5px] border-ink bg-transparent px-[16px] py-[10px] text-[0.9375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <WriteReportForm
      restaurantId={navState.restaurantId}
      initialRequests={navState.requests ?? []}
    />
  );
}

function ToggleList({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {options.map((label) => {
        const on = selected.includes(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => onToggle(label)}
            className="flex w-full items-center gap-[12px] border-0 bg-transparent px-[2px] py-[9px] text-left text-ink"
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
  );
}

function WriteReportForm({
  restaurantId,
  initialRequests,
}: {
  restaurantId: number;
  initialRequests: string[];
}) {
  const navigate = useNavigate();
  const optionsState = useReportOptions();
  const submitState = useSubmitReport();

  const [ok, setOk] = useState<boolean | null>(null);
  const [requests, setRequests] = useState<string[]>(initialRequests);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [note, setNote] = useState("");

  function toggleRequest(label: string) {
    setRequests((prev) =>
      prev.includes(label)
        ? prev.filter((r) => r !== label)
        : prev.concat([label]),
    );
  }
  function toggleFeedback(label: string) {
    setFeedback((prev) =>
      prev.includes(label)
        ? prev.filter((r) => r !== label)
        : prev.concat([label]),
    );
  }

  async function handleSubmit() {
    if (ok == null) return;
    const success = await submitState.submit({
      restaurantId,
      ok,
      note,
      requests,
      feedback,
    });
    if (success) navigate(-1);
  }

  const canSubmit = ok != null && submitState.status !== "submitting";

  return (
    <div
      className={`${SCREEN_ENTER} flex h-full flex-col px-[22px] pb-[26px] pt-[58px] text-ink`}
    >
      <div className="mb-[16px] flex flex-none items-center gap-[10px]">
        <div className="flex-1 text-[1.125rem] font-bold">다녀왔어요</div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink"
        >
          닫기
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <SectionHeader title="요청한 대로 되었나요?" />
        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={() => setOk(true)}
            className={`flex-1 border-[1.5px] p-[14px] text-[0.9375rem] font-bold ${
              ok === true
                ? "border-ink bg-ink text-cream"
                : "border-ink/30 bg-transparent text-ink"
            }`}
          >
            네, 잘 됐어요
          </button>
          <button
            type="button"
            onClick={() => setOk(false)}
            className={`flex-1 border-[1.5px] p-[14px] text-[0.9375rem] font-bold ${
              ok === false
                ? "border-ink bg-ink text-cream"
                : "border-ink/30 bg-transparent text-ink"
            }`}
          >
            아쉬운 점이 있었어요
          </button>
        </div>

        {optionsState.status === "loading" && (
          <p className="mt-[16px] text-[0.9375rem]">불러오는 중...</p>
        )}
        {optionsState.status === "error" && (
          <div className="mt-[16px]">
            <p className="text-[0.9375rem] text-[#a6301f]">
              {optionsState.message}
            </p>
            <button
              type="button"
              onClick={optionsState.reload}
              className="mt-[10px] border-[1.5px] border-ink bg-transparent px-[14px] py-[8px] text-[0.84375rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
            >
              다시 시도
            </button>
          </div>
        )}
        {optionsState.status === "ready" && (
          <>
            <SectionHeader title="실제로 사용한 요청" />
            <ToggleList
              options={optionsState.options.requestPhrases}
              selected={requests}
              onToggle={toggleRequest}
            />

            <SectionHeader title="가게에 대한 피드백" />
            <ToggleList
              options={optionsState.options.feedbackPhrases}
              selected={feedback}
              onToggle={toggleFeedback}
            />
          </>
        )}

        <SectionHeader title="자유롭게 적기" />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 1000))}
          placeholder="더 하고 싶은 말이 있으면 적어주세요"
          className="min-h-[100px] w-full border-[1.5px] border-ink/30 bg-transparent p-[12px] text-[0.9375rem] text-ink placeholder:text-ink/40"
        />

        {submitState.status === "error" && (
          <p className="mt-[10px] text-[0.84375rem] text-[#a6301f]">
            {submitState.message}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`mt-[16px] w-full border-0 p-[14px] text-[0.96875rem] font-bold ${
            canSubmit
              ? "cursor-pointer bg-ink text-cream"
              : "cursor-not-allowed bg-ink/[0.18] text-ink/45"
          }`}
        >
          {submitState.status === "submitting" ? "보내는 중..." : "제보 보내기"}
        </button>
      </div>
    </div>
  );
}
