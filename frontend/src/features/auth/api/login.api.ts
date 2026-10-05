import { useApiMutation } from "../../../hooks/useApi";
import type { ApiData } from "../../../store/types";


export interface loginPayload {
    email:string ,
    password:string
}
export const useLoginUser = () => {
    return useApiMutation<ApiData,loginPayload>({
        path:"/auth/login",
        method: "POST",
        mutationKey: ["login_a_user"],
    })
};