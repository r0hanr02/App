import type { AuthStore } from "@/types/auth.types";
import { observable } from "@legendapp/state";

export const authStore = observable<AuthStore>({
  isLoggedIn: true,
  user: {
    id: "sdklfsajf",
    name: "Faisal SK",
    email: "faisal@fsk.com",
    role: "OWNER",
    phone: "9876543210",
    dateOfBirth: "24-08-2001",
    accessToken: "ldsfjsaklfjklfj",
  },
});

// {
//   id: "sdklfsajf",
//   name: "Faisal SK",
//   email: "faisal@fsk.com",
//   role: "OWNER";
//   phone: "9876543210";
//   dateOfBirth: "24-08-2001";
//   accessToken: "ldsfjsaklfjklfj";
// }
