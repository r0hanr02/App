import { Layers, LogOut } from "lucide-react";
import "./style.scss";
import { Label } from "../../ui/Form/Form";
import { useStore } from "../../../store/store";
import { Button } from "../../ui/Button/Button";
import { useHandleLogout } from "../../../features/auth/api/auth.api";

const NoOrgNavbar = () => {
  const profileImg = useStore((s) => s.data?.user.profilepic);
  const userName = useStore((s) => s.data?.user.name);

  const { mutate: logoutMutate, isPending: isLoggingOut } = useHandleLogout();

  const handleLogout = () => {
    if (isLoggingOut) return;
    logoutMutate();
  };


  return (
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
  );
};

export default NoOrgNavbar;
