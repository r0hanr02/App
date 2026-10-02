import { QueryClient } from "@tanstack/react-query";

// Single shared instance: used by <QueryClientProvider> in App.tsx
// and injected into TanStack Router context in router.ts
export const queryClient = new QueryClient();
