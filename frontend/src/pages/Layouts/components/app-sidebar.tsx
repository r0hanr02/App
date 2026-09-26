"use client";

import * as React from "react";
import { ClosedCaption, SquareTerminal } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { authStore } from "@/store/auth.store";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Spaces",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = authStore;
  console.log("USer: ", user.get());
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <Memo>
              {() => (
                <span className="truncate font-medium">{user.name.get()}</span>
              )}
            </Memo>

            <Memo>
              {() => (
                <span className="truncate text-xs">{user.email.get()}</span>
              )}
            </Memo>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton> */}
        <TeamSwitcher
          teams={[
            {
              name: "Organization 1",
              logo: ClosedCaption,
              plan: "Active",
            },
            {
              name: "Organization 2",
              logo: ClosedCaption,
              plan: "Active",
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name.get()!,
            email: user.email.get()!,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
