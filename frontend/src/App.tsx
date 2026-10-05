import {  useEffect, useMemo } from "react";
import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { queryClient } from "./lib/queryClient";
import { useStore } from "./store/store";
import ToastContainer from "./components/ui/Toast/ToastContainer";
import { authMe } from "./configs/api";

function App() {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const data = useStore((s) => s.data);

  useEffect(() => {
    authMe()
      .then((res) => {
        useStore.getState().setData({
          success: true,
          message: res.message,
          accessToken: res.accessToken,
          user: res.user,
        });
      })
      .catch(() => {
        // not logged in - stay logged out silently
      });
  }, []);

  const auth = useMemo(
    () =>
      ({
        isLoggedIn,
        user: data ?? null,
      }) as typeof router.options.context.auth,
    [isLoggedIn, data],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth }} />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
