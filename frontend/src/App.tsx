import { useValue } from "@legendapp/state/react";
import { authStore } from "./store/auth.store";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient, router } from "./router";
import { QueryClientProvider } from "@tanstack/react-query";

const App = () => {
  const isLoggedIn = useValue(() => authStore.isLoggedIn.get());
  const user = useValue(() => authStore.user.get());
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={{
          queryClient,
          isLoggedIn,
          user,
        }}
      />
    </QueryClientProvider>
  );
};

export default App;
