export type ApiData = {
  success: true;
  message: string;
  accessToken: string;
  user: UserType;
};

export type UserType = {
  id: string;
  name: string;
  email: string;
  profilepic: string;
};

export type AuthStoreType = {
  isLoggedIn: boolean;
  data: unknown;
  setData: (value: ApiData) => void;
  logOut: () => void;
};
