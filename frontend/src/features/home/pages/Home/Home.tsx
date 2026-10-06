import { useNavigate } from "@tanstack/react-router";
import { useUserOrganization } from "../../api/home.api";
import { ROUTES } from "../../../../constants/routes.constants";
import { useEffect } from "react";

const Home = () => {
  const { data, isLoading } = useUserOrganization();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (data?.data && data.data.length > 0) {
      navigate({ to: ROUTES.DASHBOARD });
    } else {
      navigate({ to: ROUTES.NOORGANIZATION });
    }
  }, [isLoading, data, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return null;
};

export default Home;
