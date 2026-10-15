import { useApiMutation } from "../../../hooks/useApi";
import type { ApiData } from "../../../store/types";
import type { loginPayload } from "../types";

export type { loginPayload } from "../types";

export const useLoginUser = () => {
    return useApiMutation<ApiData,loginPayload>({
        path:"/auth/login",
        method: "POST",
        mutationKey: ["login_a_user"],
    })
};