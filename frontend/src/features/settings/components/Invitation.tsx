import { useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { useAddMember } from "../api/settings.api";
import { toast } from "../../../components/ui/Toast/toast.api";

const Invitation = () => {
  const { activeOrg } = useActiveOrg();
  const activeOrgId = activeOrg?.organization_id._id ?? null;
  const addMember = useAddMember(activeOrgId);
  const [userId, setUserId] = useState("");

  const canInvite = activeOrg?.role === "OWNER" || activeOrg?.role === "ADMIN";

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInvite || !userId.trim() || addMember.isPending) return;
    addMember.mutate(
      { user_id: userId.trim(), role: "MEMBER" },
      {
        onSuccess: () => {
          toast.success("Invitation sent (member added)");
          setUserId("");
        },
      },
    );
  };

  return (
    <>
      <h2>Invitations</h2>
      <p>
        There is no email-invite endpoint yet, so inviting works by adding a
        user ID directly as a member.
      </p>
      <form onSubmit={handleInvite}>
        <Input
          label="User ID to invite"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Paste a user ID"
          disabled={!canInvite}
        />
        {!canInvite && <p>Only owners and admins can invite members.</p>}
        <div className="form-footer">
          <Button
            type="submit"
            variant="primary"
            isDisabled={!canInvite || addMember.isPending}
          >
            {addMember.isPending ? "Inviting…" : "Invite as member"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default Invitation;
