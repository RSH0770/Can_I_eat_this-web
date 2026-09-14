import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import type { ProfileResponse } from "./types";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; profile: ProfileResponse };

export function useProfile() {
  const { token } = useAuth();
  const [state, setState] = useState<ProfileState>({ status: "loading" });

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await apiFetch<ProfileResponse>("/api/me/profile", {
        token,
      });
      setState({ status: "ready", profile });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "프로필을 불러오지 못했습니다. 다시 시도해 주세요.",
      });
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    fetchProfile();
  }, [fetchProfile]);

  return { ...state, reload };
}
