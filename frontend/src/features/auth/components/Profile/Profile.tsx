import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2, Mail, Shield } from "lucide-react";
import { Link, useSearch } from "@tanstack/react-router";
import { Button } from "../../../../components/ui/Button/Button";
import { Label } from "../../../../components/ui/Form/Form";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useStore } from "../../../../store/store";
import { ROUTES } from "../../../../constants/routes.constants";
import { useGetUserOrganization } from "../../../home/api/home.api";
import { getOrgIdFromSearch } from "../../../../lib/orgParams";
import { useUpdateProfile } from "../../api/profile.api";
import PageHeading from "../../../../components/ui/PageHeading/PageHeading";
import type { ProfileForm, UpdateProfilePayload } from "../../types";
import "./style.scss";

const toForm = (user?: {
  name?: string;
  email?: string;
  occupation?: string;
  phone?: string;
  dateOfBirth?: string;
}): ProfileForm => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  occupation: user?.occupation ?? "",
  phone: user?.phone ?? "",
  dateOfBirth: user?.dateOfBirth ?? "",
});

function initials(name: string): string {
  const value = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return value || "?";
}

function formatRole(role: string): string {
  const lower = role.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

const Profile = () => {
  const user = useStore((s) => s.data?.user);
  const { mutate: updateMutate, isPending: isSaving } = useUpdateProfile();
  const { data: orgData } = useGetUserOrganization();
  const storedOrgId = useStore((s) => s.activeOrgId);
  const search = useSearch({ strict: false });

  const activeOrg = useMemo(() => {
    const organizations = orgData?.data ?? [];
    if (organizations.length === 0) return null;
    const urlOrgId = getOrgIdFromSearch(search);
    if (urlOrgId) {
      const match = organizations.find(
        (o) => o.organization_id?._id === urlOrgId,
      );
      if (match) return match;
    }
    if (storedOrgId) {
      const match = organizations.find(
        (o) => o.organization_id?._id === storedOrgId,
      );
      if (match) return match;
    }
    return organizations[0] ?? null;
  }, [orgData, storedOrgId, search]);

  const saved = useMemo(() => toForm(user), [user]);
  const [editing, setEditing] = useState<ProfileForm>(saved);

  useEffect(() => {
    setEditing(saved);
  }, [saved]);

  const dirty = useMemo(
    () =>
      (Object.keys(saved) as (keyof ProfileForm)[]).some(
        (key) => saved[key] !== editing[key],
      ),
    [saved, editing],
  );

  const change = (field: keyof ProfileForm, value: string) => {
    setEditing((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = editing.name.trim();
    const email = editing.email.trim();
    if (!name) {
      toast.error("Full name is required");
      return;
    }
    if (!email) {
      toast.error("Email address is required");
      return;
    }
    const payload: UpdateProfilePayload = {};
    if (name !== saved.name) payload.name = name;
    if (email.toLowerCase() !== saved.email.toLowerCase())
      payload.email = email;
    if (editing.occupation.trim() !== saved.occupation)
      payload.occupation = editing.occupation.trim();
    if (editing.phone.trim() !== saved.phone)
      payload.phone = editing.phone.trim();
    if (editing.dateOfBirth !== saved.dateOfBirth)
      payload.dateOfBirth = editing.dateOfBirth;
    if (Object.keys(payload).length === 0) return;

    updateMutate(payload, {
      onSuccess: (res) => {
        const updated = res.data;
        const storeData = useStore.getState().data;
        if (storeData) {
          useStore.getState().setData({
            ...storeData,
            user: {
              ...storeData.user,
              id: updated._id,
              name: updated.name,
              email: updated.email,
              occupation: updated.occupation ?? "",
              phone: updated.phone ?? storeData.user.phone ?? "",
              dateOfBirth:
                updated.dateOfBirth ?? storeData.user.dateOfBirth ?? "",
              profilepic: updated.profilepic ?? storeData.user.profilepic,
            },
          });
        }
        toast.success("Profile saved");
      },
    });
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          <Loader2 className="lucide lucide-loader-2" />
          <p className="label-md">
            Sign in to view your profile.{" "}
            <Link to={ROUTES.LOGIN.path as never}>Login</Link>
          </p>
        </div>
      </div>
    );
  }

  const orgName = activeOrg?.organization_id?.organization_name;

  return (
    <div className="profile-page">
      <PageHeading
        topPara="Personal account"
        title="Your profile"
        subtitle="A little about you. A better way to work together."
      />

      <section className="panel account-hero">
        {user.profilepic ? (
          <img
            src={user.profilepic}
            alt={user.name}
            className="account-profile-avatar"
          />
        ) : (
          <span className="account-profile-avatar" aria-hidden="true">
            {initials(user.name)}
          </span>
        )}
        <div>
          <h2 className="title-md">{user.name}</h2>
          <p className="para-md profile-muted">
            {user.occupation || "No occupation set"}
          </p>
          <div className="account-badges">
            {activeOrg && (
              <span className="badge label-xs">
                {formatRole(activeOrg.role)}
              </span>
            )}
            <span className="account-email">
              <Mail size={12} />
              <span className="label-sm">{user.email}</span>
            </span>
          </div>
        </div>
        <span className="badge green label-xs">Active account</span>
      </section>

      <div className="account-grid profile-grid">
        <section className="panel settings-panel">
          <h2 className="title-sm">Profile information</h2>
          <p className="para-sm profile-muted">
            Your teammates use these details to recognize and reach you.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="profile-form-fields">
              <div className="form-grid">
                <label className="label-sm">
                  Full name{" "}
                  <input
                    value={editing.name}
                    onChange={(event) => change("name", event.target.value)}
                    required
                    autoComplete="name"
                    maxLength={80}
                  />
                </label>
                <label className="label-sm">
                  Email address{" "}
                  <input
                    type="email"
                    value={editing.email}
                    onChange={(event) => change("email", event.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>
              </div>
              <label className="label-sm">
                Occupation{" "}
                <input
                  value={editing.occupation}
                  onChange={(event) => change("occupation", event.target.value)}
                  maxLength={120}
                  placeholder="e.g. Senior software engineer"
                />
                <small className="account-field-hint para-xs">
                  Your job title, shown to your teammates.
                </small>
              </label>
              <div className="form-grid">
                <label className="label-sm">
                  Phone{" "}
                  <input
                    type="tel"
                    value={editing.phone}
                    onChange={(event) => change("phone", event.target.value)}
                    autoComplete="tel"
                  />
                </label>
                <label className="label-sm">
                  Date of birth{" "}
                  <input
                    type="date"
                    value={editing.dateOfBirth}
                    onChange={(event) =>
                      change("dateOfBirth", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>
            <div className="form-footer">
              <Button
                type="button"
                variant="outline"
                isDisabled={!dirty || isSaving}
                onPress={() => setEditing(saved)}
              >
                <Label className="label-md">Cancel</Label>
              </Button>
              <Button
                type="submit"
                variant="primary"
                isDisabled={!dirty || isSaving}
                isPending={isSaving}
                loadingLabel="Saving"
              >
                <Label className="label-md">Save changes</Label>
              </Button>
            </div>
          </form>
        </section>

        <div className="account-aside">
          <section className="panel account-section">
            <div className="section-heading">
              <h2 className="label-lg">Your organization</h2>
              <Building2 size={16} />
            </div>
            {orgName ? (
              <div className="account-membership">
                <span className="org-icon" aria-hidden="true">
                  {orgName.charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong className="label-md">{orgName}</strong>
                  <small className="para-xs profile-muted">
                    {activeOrg?.role ? formatRole(activeOrg.role) : "Member"}
                  </small>
                </span>
              </div>
            ) : (
              <p className="account-empty para-sm profile-muted">
                You’re not part of an organization yet.
              </p>
            )}
          </section>
          <div className="account-callout">
            <Shield size={17} />
            <p className="para-xs">
              Your account details are personal. Organization roles are managed
              by workspace admins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
