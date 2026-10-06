import {  useEffect, useMemo } from "react";
import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { queryClient } from "./lib/queryClient";
import { useStore } from "./store/store";
import ToastContainer from "./components/ui/Toast/ToastContainer";
import { authMe } from "./features/auth/api/auth.api";


let authMePromise: ReturnType<typeof authMe> | null = null;
function getAuthMeOnce() {
  if (!authMePromise) {
    authMePromise = authMe();
    authMePromise.catch(() => {});
  }
  return authMePromise;
}

function App() {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const isAuthLoading = useStore((s) => s.isAuthLoading);
  const data = useStore((s) => s.data);

  useEffect(() => {
    let cancelled = false;
    getAuthMeOnce()
      .then((res) => {
        if (cancelled) return;
        useStore.getState().setData({
          success: true,
          message: res.message,
          accessToken: res.accessToken,
          user: res.user,
        });
      })
      .catch(() => {
       if (cancelled) return;
        useStore.getState().clearData();
      })
      .finally(() => {
        if (!cancelled) useStore.getState().setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const auth = useMemo(
    () =>
      ({
        isLoggedIn,
        user: data ?? null,
      }) as typeof router.options.context.auth,
    [isLoggedIn, data],
  );

  if (isAuthLoading) {
   return (
      <QueryClientProvider client={queryClient}>
        <div>Loading...</div>
        <ToastContainer />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth }} />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
