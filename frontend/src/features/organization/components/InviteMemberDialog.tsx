import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "../../../components/ui/Button/Button";
import { DropDown } from "../../../components/ui/DropDown/DropDown";
import { Input } from "../../../components/ui/Input/Input";
import { Label } from "../../../components/ui/Form/Form";
import { Modal } from "../../../components/ui/Modal/Modal";
import { toast } from "../../../components/ui/Toast/toast.api";
import { useAddMember } from "../api/organization.api";

interface Props {
  orgId: string | null;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { label: "Member", value: "MEMBER" },
  { label: "Admin", value: "ADMIN" },
] as const;

type RoleInput = (typeof ROLE_OPTIONS)[number]["value"];

// The backend has no email-invite endpoint yet
// (POST /organization/:id/member takes a user_id + role),
// so "invite" adds a user ID directly — same pattern as Settings > Members.
const InviteMemberDialog = ({ orgId, isOwner, isOpen, onClose }: Props) => {
  const addMember = useAddMember(orgId);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<RoleInput>("MEMBER");

  const options = isOwner
    ? [...ROLE_OPTIONS]
    : [...ROLE_OPTIONS].filter((o) => o.value === "MEMBER");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || addMember.isPending) return;
    addMember.mutate(
      { user_id: userId.trim(), role },
      {
        onSuccess: () => {
          toast.success("Member added");
          setUserId("");
          setRole("MEMBER");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={{
        title: "Invite member",
        description:
          "Add a teammate by user ID. They join this workspace immediately.",
        icon: <UserPlus size={18} />,
      }}
      footer={{ hidden: true }}
    >
      <form onSubmit={handleSubmit} className="invite-form">
        <Input
          label="User ID to invite"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Paste a user ID"
          required
        />
        <div className="form-field">
          <Label className="label-sm">Role</Label>
          <DropDown
            options={options}
            value={role}
            onChange={(v) => setRole(v as RoleInput)}
            ariaLabel="Role for new member"
          />
        </div>
        {!isOwner && (
          <p className="para-xs org-muted">
            Admins can invite members. Only owners can invite admins.
          </p>
        )}
        <div className="form-footer">
          <Button type="button" variant="outline" onPress={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={!userId.trim() || addMember.isPending}
            isPending={addMember.isPending}
            loadingLabel="Inviting"
          >
            {addMember.isPending ? "Inviting…" : "Invite member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberDialog;
