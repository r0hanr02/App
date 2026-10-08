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

export const Navbar = () => {
  const profileImg = useStore((s) => s.data?.user.profilepic);
  const userName = useStore((s) => s.data?.user.name);
  const location = useLocation();
  const isNoOrgPage = location.pathname === "/no-organization";
  const { mutate: logoutMutate, isPending: isLoggingOut } = useHandleLogout();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useStore((s) => s.theme);
  const handleLogout = () => {
    if (isLoggingOut) return;
    logoutMutate();
  };

  return isNoOrgPage ? (
    <div className="navbar">
      <div className="flex aic jcc g8">
        <Layers size={30} color="#6366F1" />
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
      <div className="flex aic jcc g8"></div>
      <div className="user-details">
        <div className="search-input"></div>
        <Button leftIcon={<Plus size={16} />} variant="outline">
          <Label className="label-md">Create Task</Label>
        </Button>
        <div>|</div>
        <div className="user-img-container">
          <Bell size={22} />

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
                    navigate({ to: ROUTES.PROFILE.path });
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
