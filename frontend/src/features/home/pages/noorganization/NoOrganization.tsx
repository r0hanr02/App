import {
  Users,
} from "lucide-react";
import "./style.scss";
// import { useNavigate } from "@tanstack/react-router";

function NoOrganization() {
  // const navigate = useNavigate();
  return (
    <div className="no-org-page">
      <div className="no-org-content">
        <span className="no-org-icon">
          <Users size={30} strokeWidth={1.5} />
        </span>
        {/* <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1>Great work starts with a team.</h1>
        <p>
          You’re not part of an organization yet. Create a home for your team,
          or join the people you’re already building with.
        </p> */}
       
      </div>
   
    </div>
  );
}

export default NoOrganization;
