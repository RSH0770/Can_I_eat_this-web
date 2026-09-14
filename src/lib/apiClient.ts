// apiClient.ts
// 백엔드(https://api.mukeodo.site) 호출 공통 함수
// 화면마다 fetch를 직접 쓰지 않고 이 함수를 거치게 해서 아래를 한 곳에서 관리함
// - base URL(.env.local의 VITE_API_BASE_URL)
// - JSON 요청/응답 파싱
// - 토큰 첨부(Authorization: Bearer ...) — 로그인 이후 화면들이 공통으로 씀
// - 에러 처리 — 실패 시 서버 메시지를 담은 ApiError로 통일해서 던짐

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (API_BASE_URL === undefined) {
    throw new ApiError(
      0,
      "API 주소가 설정되지 않았습니다. .env.local에 VITE_API_BASE_URL을 추가하고 개발 서버를 재시작해 주세요.",
    );
  }

  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // 네트워크 자체가 끊긴 경우(서버 다운, CORS 차단 등) — fetch가 Response 없이 reject됨
    throw new ApiError(
      0,
      "서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.",
    );
  }

  if (res.status === 204) return undefined as T;

  // 서버가 에러 응답에도 JSON 본문({ message: "..." } 등)을 내려주는 경우가 많아서, 파싱이 안 될 때만 상태 텍스트로 대체함
  const text = await res.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    const message =
      (data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : undefined) ?? `요청이 실패했습니다. (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
