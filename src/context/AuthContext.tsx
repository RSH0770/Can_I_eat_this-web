// AuthContext.tsx
// 로그인 상태(JWT)를 앱 전체가 공유하는 컨텍스트
// - 토큰은 localStorage에 저장한다 — 새로고침해도 로그인이 풀리지 않게 하기 위함
// - login/signup 둘 다 백엔드가 TokenResponse(accessToken 포함)를 내려주므로, 회원가입 성공 시 별도로 로그인을 한 번 더 호출할 필요 없이 바로 로그인 상태가 됨
// - 실패(아이디 중복, 비밀번호 불일치 등)는 apiFetch가 던지는 ApiError를 그대로 화면단(Login.tsx/SignupFlow.tsx)에서 잡아서 문구로 보여준다 — 여기서는 감추지 않음
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "../lib/apiClient";

const TOKEN_STORAGE_KEY = "authToken";

// SignupRequest — 스웨거에 따라 gender/bloodType은 enum이 아니라 자유 문자열
// 따라서 디자인 원본의 한글 라벨 ("여성"/"A형" 등)을 그대로 보내면 됨 — 별도 매핑 불필요
export type SignupPayload = {
  loginId: string;
  password: string;
  name: string;
  gender: string;
  birthYear?: number;
  bloodType?: string;
  diseases: string[];
  cares: string[];
  allergies: string[];
  chewingDifficulty: boolean;
  medications: string[];
  medNote: string;
  showMedsOnCard: boolean;
};

type TokenResponse = {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
};

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);

  const persistToken = useCallback((next: string | null) => {
    setToken(next);
    if (next) window.localStorage.setItem(TOKEN_STORAGE_KEY, next);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (loginId: string, password: string) => {
      const res = await apiFetch<TokenResponse>("/api/auth/login", {
        method: "POST",
        body: { loginId, password },
      });
      persistToken(res.accessToken);
    },
    [persistToken],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const res = await apiFetch<TokenResponse>("/api/auth/signup", {
        method: "POST",
        body: payload,
      });
      persistToken(res.accessToken);
    },
    [persistToken],
  );

  const logout = useCallback(() => {
    persistToken(null);
  }, [persistToken]);

  const value: AuthContextValue = {
    token,
    isAuthenticated: token !== null,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- Provider와 짝을 이루는 훅이라 같은 파일에 둔다(FontScaleContext.tsx와 동일 패턴)
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
