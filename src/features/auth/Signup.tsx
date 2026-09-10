import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import {
  DISEASES,
  CARES,
  CARE_NOTES,
  ALLERGENS,
  MEDS,
  BLOODS,
  autoCaresFor,
  type Care,
} from "../../constants/diseaseCareMap";

type StepId = "s1" | "s2" | "s3" | "s4" | "s5";
const STEP_IDS: StepId[] = ["s1", "s2", "s3", "s4", "s5"];

type Gender = "여성" | "남성" | "밝히지 않음";
const GENDERS: Gender[] = ["여성", "남성", "밝히지 않음"];

const STROKE_GRADIENT =
  "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)";

function toggleInList(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

// 제목 아래 공통 구분선
function StepStroke() {
  return (
    <div
      className="mb-[12px] mt-[9px] h-[3px] rounded-[2px]"
      style={{ background: STROKE_GRADIENT }}
    />
  );
}

// 다중/단일 선택 칩
// danger=true만 알레르기 전용 톤
function Chip({
  label,
  on,
  danger,
  onClick,
}: {
  label: string;
  on: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  const base =
    "rounded-[3px] border-[1.5px] px-[12px] py-[6px] text-[0.875rem] transition-colors";
  const cls = danger
    ? on
      ? `${base} border-[#a6301f] bg-[#a6301f] text-cream`
      : `${base} border-[#a6301f]/[0.35] bg-transparent text-[#7d2114]`
    : on
      ? `${base} border-ink bg-ink text-cream`
      : `${base} border-ink/[0.28] bg-transparent text-ink`;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
    </button>
  );
}

// 텍스트 입력 필드
function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className="text-xs tracking-[.08em]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[44px] border-0 border-b-2 border-ink bg-transparent px-[2px] py-[4px] text-[1.0625rem] text-ink outline-none"
      />
    </div>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();

  const [step, setStep] = useState<StepId>("s1");

  // 1단계: 계정 만들기
  const [sid, setSid] = useState("");
  const [spw, setSpw] = useState("");
  const [spw2, setSpw2] = useState("");

  // 2단계: 기본 정보
  const [gender, setGender] = useState<Gender | "">("");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");

  // 3단계: 관리 중인 질환
  const [diseases, setDiseases] = useState<string[]>([]);
  const [diseaseCustom, setDiseaseCustom] = useState("");

  // 4단계: 특히 주의하는 것 (주의 성분)
  const [cares, setCares] = useState<string[]>([]);
  const [careCustom, setCareCustom] = useState("");

  // 5단계: 기억해 둘 의료 정보
  const [blood, setBlood] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyCustom, setAllergyCustom] = useState("");
  const [chewing, setChewing] = useState(false);
  const [meds, setMeds] = useState<string[]>([]);
  const [medNote, setMedNote] = useState("");
  const [showMeds, setShowMeds] = useState(false);

  const stepIndex = STEP_IDS.indexOf(step);
  const stepLabel = `${stepIndex + 1} / ${STEP_IDS.length}`;
  const progressPercent = ((stepIndex + 1) / STEP_IDS.length) * 100;

  const pwWarn =
    spw && spw2 && spw !== spw2
      ? "비밀번호가 서로 다릅니다."
      : spw && spw.length < 6
        ? "6자 이상으로 정해 주세요."
        : "";

  const stepBlocked =
    (step === "s1" && !(sid.trim() && spw.length >= 6 && spw === spw2)) ||
    (step === "s2" && !(name.trim() && gender));

  // TODO: 질환 매핑에 없는 직접입력 질환/성분은 autoCaresFor가 인식하지 못함 - 추후 처리 예정
  const autoCares = autoCaresFor(diseases);

  function handleBack() {
    if (stepIndex <= 0) {
      navigate("/login");
      return;
    }
    setStep(STEP_IDS[stepIndex - 1]);
  }

  function handleNext() {
    if (stepIndex === STEP_IDS.length - 1) {
      // TODO: authService.signup({ sid, spw, name, gender, birth }) - 계정 정보는 서버로
      // TODO: medicalProfileStore.save({ diseases, cares, blood, allergies, chewing, meds, medNote, showMeds }) - 의료 정보는 이 기기에만 저장
      navigate("/home");
      return;
    }
    const next = STEP_IDS[stepIndex + 1];
    if (next === "s4") {
      setCares((prev) => [
        ...autoCares,
        ...prev.filter((c) => !autoCares.includes(c as Care)),
      ]);
    }
    setStep(next);
  }

  const nextLabel = step === "s5" ? "프로필 만들기" : "다음";

  return (
    <div className={`${SCREEN_ENTER} flex h-full flex-col text-ink`}>
      {/* 상단 - 뒤로가기 + 단계 표시 + 글자 크기 조정 버튼 + 진행률 바 */}
      <div className="flex-none px-[22px] pb-[10px] pt-[16px]">
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={handleBack}
            className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink"
          >
            〈 뒤로
          </button>
          <div className="flex-1" />
          <span className="text-xs font-bold">{stepLabel}</span>
          <FontSizeController
            onIncrease={increase}
            onDecrease={decrease}
            canIncrease={canIncrease}
            canDecrease={canDecrease}
          />
        </div>
        <div className="mt-[12px] h-[4px] bg-ink/[0.16]">
          <div
            className="h-full bg-ink transition-[width] duration-[250ms]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 본문 - 단계별 내용, 스크롤 기능 */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-auto px-[22px] pb-[8px] pt-[14px]">
        {/* 1단계 */}
        {step === "s1" && (
          <>
            <h1 className="text-[1.625rem] font-bold">계정 만들기</h1>
            <StepStroke />
            <p className="mb-[22px] text-[0.84375rem] leading-[1.7]">
              아이디와 비밀번호만 정하면 됩니다.
            </p>
            <div className="flex flex-col gap-[20px]">
              <FormField
                id="sid"
                label="아이디"
                value={sid}
                onChange={setSid}
                placeholder="영문·숫자 4자 이상"
              />
              <FormField
                id="spw"
                label="비밀번호"
                type="password"
                value={spw}
                onChange={setSpw}
                placeholder="6자 이상"
              />
              <FormField
                id="spw2"
                label="비밀번호 확인"
                type="password"
                value={spw2}
                onChange={setSpw2}
                placeholder="다시 한 번"
              />
            </div>
            {pwWarn && (
              <p className="mt-[12px] text-[0.84375rem] text-[#a6301f]">
                {pwWarn}
              </p>
            )}
          </>
        )}

        {/* 2단계 */}
        {step === "s2" && (
          <>
            <h1 className="text-[1.625rem] font-bold">기본 정보</h1>
            <StepStroke />
            <p className="mb-[22px] text-[0.84375rem] leading-[1.7]">
              카드 속 문구와 기준량을 정하는 데 쓰입니다.
            </p>
            <div className="flex flex-col gap-[22px]">
              <div className="flex flex-col gap-[7px]">
                <span className="text-xs tracking-[.08em]">성별</span>
                <div className="flex gap-[8px]">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`min-h-[46px] flex-1 border-[1.5px] border-ink text-[0.96875rem] font-bold ${
                        gender === g
                          ? "bg-ink text-cream"
                          : "bg-transparent text-ink"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <FormField
                id="nm"
                label="이름"
                value={name}
                onChange={setName}
                placeholder="식당에 보여줄 이름"
              />
              <FormField
                id="by"
                label="출생년도"
                value={birth}
                onChange={setBirth}
                placeholder="예: 1958"
              />
            </div>
          </>
        )}

        {/* 3단계 */}
        {step === "s3" && (
          <>
            <h1 className="text-[1.625rem] font-bold">관리 중인 질환</h1>
            <StepStroke />
            <p className="mb-[22px] text-[0.84375rem] leading-[1.7]">
              해당하는 것을 모두 골라 주세요. 고르면 관련 주의 성분이 다음
              단계에 미리 담깁니다.
            </p>
            <div className="flex flex-wrap gap-[7px]">
              {DISEASES.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  on={diseases.includes(d)}
                  onClick={() => setDiseases((prev) => toggleInList(prev, d))}
                />
              ))}
            </div>
            <div className="mt-[22px]">
              <FormField
                id="dcust"
                label="직접 입력"
                value={diseaseCustom}
                onChange={setDiseaseCustom}
                placeholder="목록에 없는 질환"
              />
            </div>
            {autoCares.length > 0 && (
              <div className="mt-[22px] border-[1.5px] border-ink p-[16px]">
                <div className="text-xs tracking-[.08em]">
                  미리 담기는 주의 성분
                </div>
                <div className="mt-[8px] flex flex-wrap gap-[10px]">
                  {autoCares.map((c) => (
                    <span key={c} className="text-[0.84375rem] font-bold">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-[10px] text-[0.84375rem]">
                  다음 단계에서 지우거나 더 고를 수 있습니다.
                </p>
              </div>
            )}
          </>
        )}

        {/* 4단계 */}
        {step === "s4" && (
          <>
            <h1 className="text-[1.625rem] font-bold">특히 주의하는 것</h1>
            <StepStroke />
            <p className="mb-[22px] text-[0.84375rem] leading-[1.7]">
              음식의 어떤 부분이 걸리는지 찾는 기준이 됩니다.
            </p>
            <div className="flex flex-wrap gap-[7px]">
              {CARES.map((c) => (
                <Chip
                  key={c}
                  label={autoCares.includes(c) ? `${c} · 자동` : c}
                  on={cares.includes(c)}
                  onClick={() => setCares((prev) => toggleInList(prev, c))}
                />
              ))}
            </div>
            <div className="mt-[22px]">
              <FormField
                id="ccust"
                label="직접 입력"
                value={careCustom}
                onChange={setCareCustom}
                placeholder="목록에 없는 성분"
              />
            </div>
            <div className="mt-[22px] flex flex-col gap-[14px]">
              {cares
                .filter((c): c is Care => c in CARE_NOTES)
                .map((c) => (
                  <div key={c} className="flex items-baseline gap-[12px]">
                    <span className="min-w-[84px] flex-none border-b-2 border-ink pb-[2px] text-[0.84375rem] font-bold">
                      {c}
                    </span>
                    <span className="flex-1 text-[0.84375rem]">
                      {CARE_NOTES[c]}
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* 5단계 */}
        {step === "s5" && (
          <>
            <h1 className="text-[1.625rem] font-bold">기억해 둘 의료 정보</h1>
            <StepStroke />
            <p className="mb-[22px] text-[0.84375rem] leading-[1.7]">
              비워 두어도 카드는 만들어집니다.
            </p>

            <div className="flex flex-col gap-[7px]">
              <span className="text-xs tracking-[.08em]">혈액형</span>
              <div className="flex gap-[7px]">
                {BLOODS.map((b) => (
                  <Chip
                    key={b}
                    label={b}
                    on={blood === b}
                    onClick={() => setBlood(b)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-[24px] border-[1.5px] border-[#a6301f] p-[16px]">
              <h2 className="text-[1.1875rem] font-bold text-[#7d2114]">
                알레르기
              </h2>
              <p className="mb-[14px] mt-[8px] text-[0.84375rem] leading-[1.7] text-[#7d2114]">
                알레르기는 조정이 아니라 <b>안전</b>의 문제라, 카드 맨 위에 눈에
                띄게 적어 드립니다.
              </p>
              <div className="flex flex-wrap gap-[7px]">
                {ALLERGENS.map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    danger
                    on={allergies.includes(a)}
                    onClick={() =>
                      setAllergies((prev) => toggleInList(prev, a))
                    }
                  />
                ))}
              </div>
              <div className="mt-[16px]">
                <FormField
                  id="acust"
                  label="직접 입력"
                  value={allergyCustom}
                  onChange={setAllergyCustom}
                  placeholder="목록에 없는 알레르기"
                />
              </div>
            </div>

            <div className="mt-[24px]">
              <span className="text-xs tracking-[.08em]">식사 보조</span>
              <button
                type="button"
                onClick={() => setChewing((v) => !v)}
                className="mt-[8px] flex w-full items-center gap-[12px] border-0 bg-transparent p-0 py-[10px] text-left text-ink"
              >
                <span
                  className={`flex h-[24px] w-[24px] flex-none items-center justify-center rounded-[2px] border-[1.5px] text-[0.8125rem] ${
                    chewing
                      ? "border-ink bg-ink text-cream"
                      : "border-ink/30 bg-transparent text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="text-[0.96875rem]">
                  저는 씹거나 삼키기가 어려워요
                </span>
              </button>
            </div>

            <div className="mt-[18px]">
              <span className="text-xs tracking-[.08em]">
                복용 중인 약 (선택)
              </span>
              <div className="mt-[8px] flex flex-wrap gap-[7px]">
                {MEDS.map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    on={meds.includes(m)}
                    onClick={() => setMeds((prev) => toggleInList(prev, m))}
                  />
                ))}
              </div>
              <div className="mt-[16px]">
                <FormField
                  id="mnote"
                  label="직접 입력"
                  value={medNote}
                  onChange={setMedNote}
                  placeholder="직접 입력"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowMeds((v) => !v)}
                className="mt-[14px] flex w-full items-center gap-[12px] border-0 bg-transparent p-0 py-[10px] text-left text-ink"
              >
                <span
                  className={`flex h-[24px] w-[24px] flex-none items-center justify-center rounded-[2px] border-[1.5px] text-[0.8125rem] ${
                    showMeds
                      ? "border-ink bg-ink text-cream"
                      : "border-ink/30 bg-transparent text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="text-[0.96875rem]">카드에 함께 보여주기</span>
              </button>
              <p className="text-xs">
                식당에 알릴 필요가 없다면 꺼 두세요. 앱에만 저장됩니다.
              </p>
            </div>

            <p className="mt-[20px] text-xs leading-[1.75]">
              입력하신 정보는 이 기기에만 남습니다. 의학적 진단이나 처방을
              대신하지 않습니다.
            </p>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex-none px-[22px] pb-[30px] pt-[10px]">
        <button
          type="button"
          onClick={handleNext}
          disabled={stepBlocked}
          className={`min-h-[52px] w-full border-0 text-[1.125rem] font-bold ${
            stepBlocked
              ? "cursor-not-allowed bg-ink/25 text-cream/75"
              : "cursor-pointer bg-ink text-cream"
          }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
