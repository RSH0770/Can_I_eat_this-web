import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const INK = "#1a1815";
const CREAM = "#e9e7e2";

type FindMode = "id" | "pw";

function isFindMode(value: string | null): value is FindMode {
  return value === "id" || value === "pw";
}

export function FindAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialMode: FindMode = isFindMode(modeParam) ? modeParam : "id";

  const [findMode, setFindMode] = useState<FindMode>(initialMode);
  const [findDone, setFindDone] = useState(false);

  // 아이디 찾기
  const [idName, setIdName] = useState("");
  const [idBirthYear, setIdBirthYear] = useState("");

  // 비밀번호 찾기
  const [pwLoginId, setPwLoginId] = useState("");
  const [pwName, setPwName] = useState("");

  function switchMode(mode: FindMode) {
    setFindMode(mode);
    setFindDone(false);
  }

  function handleFind() {
    // TODO: authService.findId({ name, birthYear }) / authService.requestPasswordReset({ loginId, name }) 연동하기
    setFindDone(true);
  }

  const findBtnLabel = findMode === "id" ? "아이디 찾기" : "재설정 안내 받기";
  const findResultTitle =
    findMode === "id" ? "아이디를 찾았습니다" : "재설정 안내를 보냈습니다";
  const findResultBody =
    findMode === "id"
      ? "가입된 아이디는 meog****12 입니다."
      : "등록된 연락처로 비밀번호 재설정 안내가 갑니다. 10분 안에 열어 주세요.";

  return (
    <div className="animate-fade-slide-up flex h-full flex-col px-[22px] pt-[62px] pb-[34px] text-[#1a1815]">
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="self-start border-0 bg-transparent p-0 text-[0.9375rem] text-[#1a1815]"
      >
        〈 로그인
      </button>

      {/* 타이틀 */}
      <h1 className="mt-[16px] text-[1.75rem] font-bold">계정 찾기</h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{
          background:
            "linear-gradient(90deg, #1a1815 0%, #1a1815 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100% )",
        }}
      />

      {/* 아이디 / 비밀번호 찾기 */}
      <div className="mt-[20px] flex gap-[8px]">
        <button
          type="button"
          onClick={() => switchMode("id")}
          className="min-h-[46px] flex-1 border-[1.5px] border-[#1a1815] text-[0.96875rem] font-bold"
          style={
            findMode === "id"
              ? { background: INK, color: CREAM }
              : { background: "transparent", color: INK }
          }
        >
          아이디 찾기
        </button>
        <button
          type="button"
          onClick={() => switchMode("pw")}
          className="min-h-[46px] flex-1 border-[1.5px] border-[#1a1815] text-[0.96875rem] font-bold"
          style={
            findMode === "pw"
              ? { background: INK, color: CREAM }
              : { background: "transparent", color: INK }
          }
        >
          비밀번호 찾기
        </button>
      </div>

      {/* 입력 폼 */}
      <div className="mt-[24px] flex flex-col gap-[20px]">
        {findMode === "pw" ? (
          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[5px]">
              <label htmlFor="fid" className="text-xs tracking-[.08em]">
                아이디
              </label>
              <input
                id="fid"
                value={pwLoginId}
                onChange={(e) => setPwLoginId(e.target.value)}
                placeholder="아이디"
                className="min-h-[44px] border-0 border-b-2 border-[#1a1815] bg-transparent px-[2px] py-[4px] text-[1.0625rem] text-[#1a1815] outline-none"
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label htmlFor="fnm" className="text-xs tracking-[.08em]">
                이름
              </label>
              <input
                id="fnm"
                value={pwName}
                onChange={(e) => setPwName(e.target.value)}
                placeholder="이름"
                className="min-h-[44px] border-0 border-b-2 border-[#1a1815] bg-transparent px-[2px] py-[4px] text-[1.0625rem] text-[#1a1815] outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[5px]">
              <label htmlFor="fnm2" className="text-xs tracking-[.08em]">
                이름
              </label>
              <input
                id="fnm2"
                value={idName}
                onChange={(e) => setIdName(e.target.value)}
                placeholder="이름"
                className="min-h-[44px] border-0 border-b-2 border-[#1a1815] bg-transparent px-[2px] py-[4px] text-[1.0625rem] text-[#1a1815] outline-none"
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label htmlFor="fby" className="text-xs tracking-[.08em]">
                출생년도
              </label>
              <input
                id="fby"
                value={idBirthYear}
                onChange={(e) => setIdBirthYear(e.target.value)}
                placeholder="예: 1958"
                className="min-h-[44px] border-0 border-b-2 border-[#1a1815] bg-transparent px-[2px] py-[4px] text-[1.0625rem] text-[#1a1815] outline-none"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleFind}
          className="min-h-[52px] border-0 text-[1.125rem] font-bold"
          style={{ background: INK, color: CREAM }}
        >
          {findBtnLabel}
        </button>
      </div>

      {/* doFind 이후에 노출될 결과 패널 */}
      {findDone && (
        <div className="mt-[22px] border-[1.5px] border-[#1a1815] p-[16px]">
          <h2 className="text-[1.125rem] font-bold">{findResultTitle}</h2>
          <p className="mt-[8px] text-[0.84375rem] leading-[1.7]">
            {findResultBody}
          </p>
        </div>
      )}

      <div className="flex-1" />
      <p className="text-xs">가입할 때 넣은 이름과 정확히 같아야 확인됩니다.</p>
    </div>
  );
}
