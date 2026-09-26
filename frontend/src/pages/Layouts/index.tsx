import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Outlet } from "@tanstack/react-router";
import { themeContext, toggleTheme } from "@/store/theme.store";
import { Show } from "@legendapp/state/react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const RootLayout = () => {
  const { theme } = themeContext;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden flex flex-col p-2 gap-2">
        <header className="flex h-16 shrink-0 items-center justify-between pr-4 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div>
            <Show
              if={() => theme.get() === "dark"}
              else={() => (
                <Button variant="secondary" onClick={toggleTheme}>
                  <Sun />
                </Button>
              )}
            >
              {() => (
                <Button variant="secondary" onClick={toggleTheme}>
                  <Moon />
                </Button>
              )}
            </Show>
          </div>
        </header>
        <ScrollArea className="flex-1 min-h-0 w-full p-4 rounded-xl bg-background/50 ">
          <Outlet />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default RootLayout;
