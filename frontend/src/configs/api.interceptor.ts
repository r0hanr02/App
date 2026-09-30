
// import type { InternalAxiosRequestConfig } from "axios";
// import { useStore } from "../store/store";
// import { axiosInstance } from "./api";

// interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//   _retry?: boolean;
// }

// const AUTH_SNAPSHOT_STORAGE_KEY = "GMR:auth-snapshot";
// const { user, isLoggedIn } = authStore;
// const user = useStore.getState().data;
// const isLoggedIn = useStore.getState().isLoggedIn;

// axiosInstance.interceptors.request.use(
//   (config) => {
//     if (config.url?.includes("/auth/logout")) {
//       config.headers["X-Refresh-Token"] = user.data.refresh_token.get();
//     } else if (config.url?.includes("/auth/refresh")) {
//       config.headers["X-Refresh-Token"] = user.data.refresh_token.get();
//     } else {
//       const accessToken = user.data.access_token.get();

//       if (accessToken) {
//         config.headers.Authorization = `Bearer ${accessToken}`;
//       }
//     }
//     return config;
//   },
//   (error: AxiosError) => {
//     console.log(error);
//     return Promise.reject(error);
//   },
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as CustomAxiosRequestConfig;

//     if (
//       error.response?.status === 401 &&
//       originalRequest &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         const currentUser = user.data.get();
//         const refreshToken = (currentUser as { refresh_token?: string } | null)
//           ?.refresh_token;

//         if (refreshToken) {
//           const response = await refreshInstance.post("/auth/refresh", null, {
//             params: { refresh_token: refreshToken },
//           });

//           const data = response.data;
//           const newAccessToken =
//             typeof data === "string" ? data : data?.access_token || data?.token;

//           if (newAccessToken && typeof newAccessToken === "string") {
//             if (currentUser) {
//               user.data.set({
//                 ...currentUser,
//                 access_token: newAccessToken,
//               });
//             }

//             originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//             return axiosInstance(originalRequest);
//           }
//         }
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//       }
//       isLoggedIn.set(false);
//       user.set(null);
//     //   localStorage.removeItem(storageKey);
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     }

//     return Promise.reject(error);
//   },
// );
