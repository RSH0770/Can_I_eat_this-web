import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../../lib/apiClient";

export type FeedbackOptionsResponse = {
  feedbackPhrases: string[];
  requestPhrases: string[];
};

type OptionsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; options: FeedbackOptionsResponse };

export function useReportOptions() {
  const [state, setState] = useState<OptionsState>({ status: "loading" });

  const fetchOptions = useCallback(async () => {
    try {
      const options = await apiFetch<FeedbackOptionsResponse>(
        "/api/reports/options",
      );
      setState({ status: "ready", options });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "문구 목록을 불러오지 못했습니다. 다시 시도해 주세요.",
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOptions();
  }, [fetchOptions]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    fetchOptions();
  }, [fetchOptions]);

  return { ...state, reload };
}
