import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontSizeController } from "../../components/FontSizeController";
import { useFontScale } from "../../context/FontScaleContext";
import { SCREEN_ENTER } from "../../constants/animation";
import AppLogo from "../../assets/AppLogo.png";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/apiClient";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await login(loginId, loginPw);
      navigate("/home");
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "로그인에 실패했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`${SCREEN_ENTER} flex h-full flex-col pb-[34px] pl-[22px] pr-[22px] pt-[62px] text-ink`}
    >
      <div className="flex items-center justify-between gap-[12px]">
        <img src={AppLogo} alt="먹어도 돼?" className="h-[42px] w-auto" />
        {/* 글자 크기 조절 */}
        <FontSizeController
          onIncrease={increase}
          onDecrease={decrease}
          canIncrease={canIncrease}
          canDecrease={canDecrease}
        />
      </div>

      {/* 타이틀 */}
      <h1 className="mt-[26px] text-[1.875rem] font-bold">로그인</h1>
      <div
        className="mt-[9px] h-[3px] rounded-[2px]"
        style={{
          background:
            "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 62%, rgba(26,24,21,.35) 86%, rgba(26,24,21,0) 100%)",
        }}
      />
      <p className="mb-[26px] mt-[12px] text-[0.84375rem]">
        아이디와 비밀번호를 넣어 주세요.
      </p>

      {/* 입력 폼 */}
      <div className="flex flex-col gap-[20px]">
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="lid" className="text-xs tracking-[.08em]">
            아이디
          </label>
          <input
            id="lid"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디"
            autoComplete="username"
            className="min-h-[44px] border-0 border-b-2 border-ink bg-transparent px-[2px] py-[4px] text-[1.0625rem] text-ink outline-none"
          />
        </div>
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="lpw" className="text-xs tracking-[.08em]">
            비밀번호
          </label>
          <input
            id="lpw"
            type="password"
            value={loginPw}
            onChange={(e) => setLoginPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing)
                handleLogin();
            }}
            placeholder="비밀번호"
            className="min-h-[44px] border-0 border-b-2 border-ink bg-transparent px-[2px] py-[4px] text-[1.0625rem] text-ink outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="mt-[12px] text-[0.84375rem] text-[#a6301f]">{error}</p>
      )}

      {/* 로그인 버튼 */}
      <button
        type="button"
        onClick={handleLogin}
        disabled={submitting}
        className="mt-[26px] min-h-[52px] border-0 bg-ink text-[1.125rem] font-bold text-[#e9e7e2]"
      >
        {submitting ? "로그인 중..." : "로그인"}
      </button>

      {/* 아이디 / 비밀번호 찾기 */}
      <div className="mt-[14px] flex items-center justify-center gap-[8px]">
        <button
          type="button"
          onClick={() => navigate("/find-account?mode=id")}
          className="border-0 bg-transparent px-[4px] py-[10px] text-[0.90625rem] text-ink underline underline-offset-[3px]"
        >
          아이디 찾기
        </button>
        <span className="opacity-40">·</span>
        <button
          type="button"
          onClick={() => navigate("/find-account?mode=pw")}
          className="border-0 bg-transparent px-[4px] py-[10px] text-[0.90625rem] text-ink underline underline-offset-[3px]"
        >
          비밀번호 찾기
        </button>
      </div>

      <div className="flex-1" />

      {/* 회원가입 */}
      <button
        type="button"
        onClick={() => navigate("/signup")}
        className="min-h-[52px] border-[1.5px] border-ink bg-transparent text-[1.0625rem] font-bold text-ink transition-colors hover:bg-ink/[0.06]"
      >
        회원가입
      </button>
    </div>
  );
}
