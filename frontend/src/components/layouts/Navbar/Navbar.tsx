import { Bell, File, Layers, LogOut, Moon, Plus, Sun } from "lucide-react";
import "./style.scss";
import { Label } from "../../ui/Form/Form";
import { useStore } from "../../../store/store";
import { Button } from "../../ui/Button/Button";
import { useHandleLogout } from "../../../features/auth/api/auth.api";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { DialogTrigger, Popover } from "react-aria-components";
import { useState } from "react";
import { ROUTES } from "../../../constants/routes.constants";
import { SIDEBAR } from "../../../constants/sidebar.constants";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { useNotificationCount } from "../../../features/notification/hooks/useNotificationCount";
import { getRoutePath } from "../../../factories/RouteFactory";

/** Fallback label for routes not listed in the sidebar (e.g. /profile). */
function prettifyPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment) return "Dashboard";
  const words = segment.replace(/[-_]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export const Navbar = () => {
  const profileImg = useStore((s) => s.data?.user.profilepic);
  const userName = useStore((s) => s.data?.user.name);
  const location = useLocation();
  const isNoOrgPage = location.pathname === "/no-organization";
  const { mutate: logoutMutate, isPending: isLoggingOut } = useHandleLogout();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useStore((s) => s.theme);
  const { activeOrgSlug, activeOrg } = useActiveOrg();
  const homePath = activeOrgSlug ? `/${activeOrgSlug}` : null;

  const { count: notifCount, reset: resetNotifCount } = useNotificationCount();

  const resolveFullPath = (routeKey: keyof typeof ROUTES, routeTo: string) =>
    ROUTES[routeKey].orgScoped && activeOrgSlug
      ? `/${activeOrgSlug}${routeTo === "/" ? "" : routeTo}`
      : routeTo;

  const currentPage =
    (homePath && location.pathname === homePath ? "Dashboard" : undefined) ??
    SIDEBAR.find((item) => {
      const fullPath = resolveFullPath(item.routeKey, item.routeTo);
      if (item.routeKey === "HOME") {
        return location.pathname === fullPath || location.pathname === homePath;
      }
      return (
        location.pathname === fullPath ||
        location.pathname.startsWith(`${fullPath}/`)
      );
    })?.label ??
    prettifyPath(location.pathname);

  const activeOrgName = activeOrg?.organization_id?.organization_name;
  const handleLogout = () => {
    if (isLoggingOut) return;
    logoutMutate();
  };

  return isNoOrgPage ? (
    <div className="navbar">
      <div className="flex aic jcc g8">
        <Layers size={30} color="var(--accent)" />
        <Label className="title-lg">orbit .</Label>
      </div>
      <div className="user-details">
        {userName && <Label className="label-md">{userName}</Label>}
        {profileImg ? (
          <img src={profileImg} alt={userName ?? "user"} className="user-img" />
        ) : (
          userName && (
            <span className="user-img user-img-fallback" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </span>
          )
        )}
        <Button
          variant="outline"
          onClick={handleLogout}
          isDisabled={isLoggingOut}
          isPending={isLoggingOut}
          loadingLabel="Logging out"
        >
          <LogOut />
        </Button>
      </div>
    </div>
  ) : (
    <div className="navbar">
      <nav className="navbar-breadcrumb" aria-label="Breadcrumb">
        <span className="crumb crumb-page" aria-current="page">
          {`${activeOrgName} > ${currentPage}`}
        </span>
      </nav>
      <div className="user-details">
        <div className="search-input"></div>
        <Button leftIcon={<Plus size={16} />} variant="outline">
          <Label className="label-md">Create Task</Label>
        </Button>
        <div>|</div>
        <div className="user-img-container">
          <button
            className="bell-wrapper"
            aria-label={`Notifications${notifCount > 0 ? `, ${notifCount} unread` : ""}`}
            onClick={() => {
              resetNotifCount();
              navigate({ to: getRoutePath("NOTIFICATION") as any });
            }}
          >
            <Bell size={22} />
            {notifCount > 0 && (
              <span className="notif-badge" aria-hidden="true">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>

          <div className="user-img-wrapper">
            <DialogTrigger
              isOpen={isPopoverOpen}
              onOpenChange={setIsPopoverOpen}
            >
              <Button variant="outline" className="user-img-btn">
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt={userName ?? "user"}
                    className="user-img"
                  />
                ) : (
                  userName && (
                    <span
                      className="user-img user-img-fallback"
                      aria-hidden="true"
                    >
                      {userName
                        .split(" ")
                        .map((name) => name.charAt(0).toUpperCase())
                        .join("")}
                    </span>
                  )
                )}
              </Button>
              <Popover
                placement="bottom end"
                shouldFlip
                className="admin-popover-menu"
              >
                <Button
                  variant="ghost"
                  className="popover-item"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    navigate({
                      to: ROUTES.PROFILE.path as any,
                    }).catch((err) => {
                      console.warn("Navigation to profile failed:", err);
                    });
                  }}
                >
                  <File />
                  <Label className="label-md">My Profile</Label>
                </Button>
                <div className="divider"></div>
                <Button
                  variant="ghost"
                  className="popover-item"
                  onClick={() =>
                    useStore.setState({
                      theme: theme === "light" ? "dark" : "light",
                    })
                  }
                >
                  {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                  <Label className="label-md">
                    Switch to {theme === "light" ? "Dark" : "Light"} Mode
                  </Label>
                </Button>
                <div className="divider"></div>
                <Button
                  variant="ghost"
                  className="popover-item logout"
                  onClick={handleLogout}
                >
                  <LogOut />
                  <Label className="label-md">Logout</Label>
                </Button>
              </Popover>
            </DialogTrigger>
          </div>
        </div>
      </div>
    </div>
  );
};
