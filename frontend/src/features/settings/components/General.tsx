import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { useOrganization, useUpdateOrganization } from "../api/settings.api";
import { toast } from "../../../components/ui/Toast/toast.api";

const General = () => {
  const { activeOrgId, activeOrg } = useActiveOrg();
  const { data: org, isLoading } = useOrganization(activeOrgId);
  const update = useUpdateOrganization(activeOrgId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (org) {
      setName(org.organization_name ?? "");
      setDescription(org.organization_description ?? "");
      setSlug(org.slug ?? "");
    }
  }, [org]);

  const canEdit = activeOrg?.role === "OWNER" || activeOrg?.role === "ADMIN";

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit || update.isPending) return;
    update.mutate(
      {
        organization_name: name.trim(),
        organization_description: description,
        ...(slug.trim() ? { slug: slug.trim() } : {}),
      },
      {
        onSuccess: () => toast.success("Workspace updated"),
      },
    );
  };

  if (isLoading) return <p>Loading…</p>;
  if (!org) return <p>No workspace selected.</p>;

  return (
    <>
      <h2>General</h2>
      <p>Update your workspace name, description and URL slug.</p>
      <form onSubmit={handleSubmit}>
        <Input
          label="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Inc"
          required
          disabled={!canEdit}
        />
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this workspace for?"
            disabled={!canEdit}
          />
        </label>
        <label>
          Workspace URL
          <span className="url-input">
            <span>orbit /</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="acme_inc"
              disabled={!canEdit}
            />
          </span>
        </label>
        {!canEdit && <p>Only owners and admins can edit workspace details.</p>}
        <div className="form-footer">
          <Button
            type="submit"
            variant="primary"
            isDisabled={!canEdit || update.isPending}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default General;
