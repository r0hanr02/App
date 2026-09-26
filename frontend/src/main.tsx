import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./store/theme.store.ts";
import { Toaster } from "@/components/ui/toast.tsx";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>,
);
