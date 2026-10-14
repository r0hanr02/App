import { useParams } from "@tanstack/react-router";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";

const Home = () => {
  const { activeOrg, activeOrgSlug } = useActiveOrg();
  const params = useParams({ strict: false }) as { orgSlug?: string };
  return (
    <div>
      Home — {activeOrg?.organization_id?.organization_name ?? "No org"} (
      {params.orgSlug ?? activeOrgSlug ?? "no slug"})
    </div>
  );
};

export default Home;
