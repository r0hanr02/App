import type { UserType } from "../../../store/types";

/* Auth API response / payload types */

export type logoutResponse = { success: boolean; message: string };

export interface loginPayload {
  email: string;
  password: string;
}

export interface ProfileMeResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: UserType & {
    phone?: string;
    dateOfBirth?: string;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  occupation?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    occupation?: string;
    phone?: string;
    dateOfBirth?: string;
    profilepic?: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    occupation: string;
    profilepic: string;
  };
}

/* Auth form state types */

export type ProfileForm = {
  name: string;
  email: string;
  occupation: string;
  phone: string;
  dateOfBirth: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  name: string;
  email: string;
  dob: string;
  occupation: string;
  password: string;
  phone: string;
  pic: File | null;
};
