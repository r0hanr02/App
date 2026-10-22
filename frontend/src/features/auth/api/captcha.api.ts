import { useApiQuery } from "../../../hooks/useApi";
import type { CaptchaResponse } from "../types";

export const useCaptcha = () => {
  return useApiQuery<CaptchaResponse>({
    queryKey: ["captcha"],
    path: "/auth/captcha",
    options: {
      // Always ask for a fresh challenge so the cookie never goes stale.
      staleTime: 0,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  });
};
