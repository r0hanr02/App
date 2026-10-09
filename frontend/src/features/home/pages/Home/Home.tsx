import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../../constants/routes.constants";
import { useEffect } from "react";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { withOrgSearch } from "../../../../lib/orgParams";

const Home = () => {
  const { organizations, activeOrgId, isLoading } = useActiveOrg();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (organizations.length === 0) {
      navigate({ to: ROUTES.NOORGANIZATION.path as any });
    }
  }, [isLoading, organizations.length, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      HOME
      {activeOrgId && (
        <div style={{ display: "none" }}>
          {JSON.stringify(withOrgSearch(activeOrgId))}
        </div>
      )}
    </div>
  );
};

export default Home;
