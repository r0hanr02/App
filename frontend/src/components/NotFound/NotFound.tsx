import { ArrowLeft, Compass, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import "./style.scss";
import { Label } from "../ui/Form/Form";
import { Button } from "../ui/Button/Button";
import { ROUTES } from "../../constants/routes.constants";
import { useActiveOrg } from "../../hooks/useActiveOrg";

const NotFound = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const { activeOrgSlug } = useActiveOrg();

  const goHome = () => {
    if (activeOrgSlug) {
      navigate({
        to: "/$orgSlug" as never,
        params: { orgSlug: activeOrgSlug } as never,
      }).catch((err) => {
        console.warn("Navigation home failed:", err);
      });
    } else {
      navigate({ to: ROUTES.NOORGANIZATION.path as never }).catch((err) => {
        console.warn("Navigation home failed:", err);
      });
    }
  };

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-icon" aria-hidden="true">
          <Compass size={36} strokeWidth={1.5} />
        </span>
        <Label className="label-md not-found-eyebrow">
          404 — Page not found
        </Label>
        <Label className="title-xl not-found-title">Lost in orbit?</Label>
        <p className="para-md not-found-text">
          The page{" "}
          <code className="not-found-path">{location.pathname}</code> doesn’t
          exist or was moved.
        </p>
        <div className="not-found-actions">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onPress={() => router.history.back()}
          >
            <Label className="label-md">Go back</Label>
          </Button>
          <Button
            variant="primary"
            leftIcon={<LayoutDashboard size={16} />}
            onPress={goHome}
          >
            <Label className="label-md">Go to Dashboard</Label>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
