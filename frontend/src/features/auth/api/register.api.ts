import { useApiMutation } from "../../../hooks/useApi";

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    profilepic: string;
  };
}

export const useRegisterUserProfile = () => {
  return useApiMutation<RegisterResponse, FormData>({
    path: "/auth/register",
    method: "POST",
    mutationKey: ["register_a_user"],
  });
};
