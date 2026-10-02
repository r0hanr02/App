import {  useMemo } from "react";
import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { queryClient } from "./lib/queryClient";
import { useStore } from "./store/store";
import ToastContainer from "./components/ui/Toast/ToastContainer";

function App() {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const data = useStore((s) => s.data);

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
