import type { Role } from "./routes.types";

export type User = {
  id: string;
  name: string;
  email: string;
  role?: Role;
  phone: string;
  dateOfBirth: string;
  accessToken?: string;
};

export type AuthStore = {
  isLoggedIn: boolean;
  user: User | null;
};

export type AuthSnapShot = {
  isLoggedIn: boolean;
  user: User | null;
  savedAt: string;
};

export type MeResponse = {
  ok: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role?: Role;
    phone: string;
    dateOfBirth: string;
  };
};
