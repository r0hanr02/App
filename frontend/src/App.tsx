import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "./components/ui/Button/Button";
import { toast } from "./components/ui/Toast/toast.api";
import ToastContainer from "./components/ui/Toast/ToastContainer";
import { useApiMutation, useApiQuery } from "./hooks/useApi";

// One client for the whole app (create once, outside the component)
const queryClient = new QueryClient();

type HealthResponse = {
  status: string;
};

type CreateUserPayload = {
  name: string;
};

type CreateUserResponse = {
  id: string;
  name: string;
};

function ApiExample() {
  // 1. QUERY (GET) — auto-fetches on mount
  const {
    data,
    state: queryState,
    refetch,
  } = useApiQuery<HealthResponse>({
    queryKey: ["health"],
    path: "/health",
    options: {
      enabled: false,
    },
  });

  // 2. MUTATION (POST) — fires on button click
  const { mutate, state: mutationState } = useApiMutation<
    CreateUserResponse,
    CreateUserPayload
  >({
    path: "/users",
    method: "POST",
    options: {
      onSuccess: (newUser) => {
        toast.success("User created!", JSON.stringify(newUser));
        // Refresh the query above if needed:
        // queryClient.invalidateQueries({ queryKey: ["health"] });
      },
      onError: (err) => {
        toast.error("Create failed", err.message);
      },
    },
  });

  return (
    <div style={{ display: "grid", gap: 16, padding: 24 }}>
      {/* ----- Query state (normal React state, no .get()) ----- */}
      <h2>GET /health</h2>
      {queryState.isLoading && <p>Loading…</p>}
      {queryState.isError && <p>Error: {queryState.errorMessage}</p>}
      {data && <p>Status: {data.status}</p>}
      <Button
        variant="secondary"
        onPress={() => refetch()}
        isDisabled={queryState.isFetching}
      >
        {queryState.isFetching ? "Refetching…" : "Refetch"}
      </Button>

      {/* ----- Mutation state ----- */}
      <h2>POST /users</h2>
      <Button
        variant="primary"
        onPress={() => mutate({ name: "John" })}
        isPending={mutationState.isPending}
        isDisabled={mutationState.isPending}
      >
        Create user
      </Button>
      {mutationState.isError && <p>Error: {mutationState.errorMessage}</p>}
      {mutationState.isSuccess && <p>User created!</p>}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiExample />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
