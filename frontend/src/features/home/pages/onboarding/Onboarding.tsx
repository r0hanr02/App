import { Layers } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import { Label } from "../../../../components/ui/Form/Form";
import { Input } from "../../../../components/ui/Input/Input";
import "./style.scss";
import { useEffect, useState } from "react";
import { useCreateOrganization } from "../../api/home.api";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../../constants/routes.constants";

const Onboarding = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_slug: "",
    organization_description: "",
    organization_logo: null as File | null,
  });

  const navigate = useNavigate();
  const { mutate, isPending } = useCreateOrganization();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "organization_logo") {
      const file = files?.[0] ?? null;

      setFormData((prev) => ({
        ...prev,
        organization_logo: file,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!formData.organization_logo) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formData.organization_logo);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.organization_logo]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("organization_name", formData.organization_name);
    fd.append("organization_slug", formData.organization_slug);
    fd.append("organization_description", formData.organization_description);
    if (formData.organization_logo) {
      fd.append("organization_logo", formData.organization_logo);
    }

    mutate(fd, {
      onSuccess: (response) => {
        toast.success(response.message, "Organization created successfully");
        navigate({ to: ROUTES.HOME.path });
      },
      onError: (error) => {
        toast.error("Error creating organization.");
        console.error("Error creating organization:", error);
      },
    });
  };

  return (
    <div className="org flex w100 aic jcc fdc g12">
      {/* Brand */}
      <div className="flex aic jcc g12">
        <Layers size={30} color="#6366F1" />
        <Label className="title-lg">orbit.</Label>
      </div>

      {/* Register Card */}
      <div className="register g8">
        <div className="register-logo">
          <Layers size={30} color="#6366F1" />
        </div>

        <div className="flex fdc g8">
          <Label className="subheading-xs">YOUR WORKSPACE, YOUR WAY</Label>
          <Label className="title-md">Your next great idea starts here.</Label>
          <Label className="para-sm">
            Create a shared home for the things you’re building.
          </Label>
        </div>

        <form className="register-form g12" onSubmit={handleSubmit}>
          <Label className="profile-upload">
            <input
              type="file"
              name="organization_logo"
              accept="image/*"
              onChange={handleChange}
            />

            {preview ? (
              <img src={preview} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">
                <span>Upload</span>
              </div>
            )}
          </Label>
          <Input
            name="organization_name"
            type="text"
            value={formData.organization_name}
            label="Organization Name:"
            placeholder="Orbit."
            onChange={handleChange}
          />
          <Input
            name="organization_slug"
            type="text"
            value={formData.organization_slug}
            label="Organization Slug:"
            placeholder="orbit_saas"
            onChange={handleChange}
          />
          <Input
            name="organization_description"
            type="text"
            value={formData.organization_description}
            label="Organization Description:"
            placeholder="Describe your organization"
            onChange={handleChange}
          />

          <Button
            type="submit"
            className="register-button"
            loadingLabel="Registering"
            isPending={isPending}
          >
            Create Organization
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
