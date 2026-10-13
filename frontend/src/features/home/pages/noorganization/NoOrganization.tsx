import { CircleQuestionMark, Layers, Users } from "lucide-react";
import "./style.scss";
import { Label } from "../../../../components/ui/Form/Form";
import NoOrgCard from "../../components/NoOrgCard/NoOrgCard";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../../constants/routes.constants";

function NoOrganization() {
  const navigate = useNavigate();
  return (
    <div className="no-org-page fdc">
      <div className="no-org-content flex fdc jcc aic g8">
        <span className="no-org-icon">
          <Users size={34} strokeWidth={1.5} />
        </span>
        <Label className="label-md">YOUR NEXT CHAPTER STARTS HERE</Label>
        <Label className="title-xl">Great work starts with a team.</Label>
        <div className="para-sm">
          You’re not part of an organization yet. Create a home for your team,
          or join the people you’re already building with.
        </div>
      </div>
      <div className="no-org-panel flex g10 ">
        <NoOrgCard
          logo={<Layers size={30} strokeWidth={1.5} />}
          title="Create Organization"
          subheading="Start fresh with a shared workspace for your projects, tasks, and team."
          btnText="Create Organization"
          btnOnclick={() => {
            void navigate({ to: ROUTES.ONBOARDING.path });
          }}
          btnVariant="primary"
          note="You’ll  be the organization Owner."
        />
        <NoOrgCard
          logo={<Users size={30} strokeWidth={1.5} />}
          title="Join Organization"
          subheading="Already have a team on Orbit? Use the invitation link your admin sent you."
          btnText="Join Organization"
          btnOnclick={() => {}}
          btnVariant="secondary"
          note="Check your inbox for an invite from Orbit."
        />
      </div>
      <div className="no-org-note flex aic jcc g8">
        {/* <div> */}
        <CircleQuestionMark size={14} />
        {/* </div> */}
        <div>
          Expecting an invitation? Ask your organization admin to send one.
        </div>
      </div>
    </div>
  );
}

export default NoOrganization;
