export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  occupation?: string;
  profilepic?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateMeInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  dateOfBirth?: unknown;
  occupation?: unknown;
  profilepic?: unknown;
}
