import { useEffect, useMemo } from "react";
import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { queryClient } from "./lib/queryClient";
import { useStore } from "./store/store";
import ToastContainer from "./components/ui/Toast/ToastContainer";
import { authMe } from "./features/auth/api/auth.api";
import { ROUTES } from "./constants/routes.constants";
import { socket } from "./lib/socket";

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
  const location = window.location.pathname;
  const isLoginPath = location === ROUTES.LOGIN.path;
  const accessToken = useStore.getState().data?.accessToken;

  useEffect(() => {
    let cancelled: boolean;
    if (!isLoginPath) {
      cancelled = false;
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
    } else {
      useStore.getState().setAuthLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      socket.disconnect();
      return;
    }

    socket.auth = { token: accessToken };

    console.log(`has Access Token`, Boolean(accessToken));
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const pingFromServer = (data: { message: string; received: string }) => {
      console.warn("received from Backend", data);
    };
    socket.on("pong-client", pingFromServer);
    socket.emit("ping-server", "Hello From frontend");
    return () => {
      socket.off("pong-client", pingFromServer);
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
