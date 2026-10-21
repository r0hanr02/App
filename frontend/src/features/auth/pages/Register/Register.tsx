import { ArrowRight, Layers } from "lucide-react";
import { Label } from "../../../../components/ui/Form/Form";
import "./style.scss";
import { Input } from "../../../../components/ui/Input/Input";
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/Button/Button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRegisterUserProfile } from "../../api/register.api";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { ROUTES } from "../../../../constants/routes.constants";
import type { RegisterFormData } from "../../types";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    dob: "",
    occupation: "",
    password: "",
    phone: "",
    pic: null,
  });

  const { mutate: registerMutate, isPending: registerIsPending } =
    useRegisterUserProfile();

  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "pic") {
      const file = files?.[0] ?? null;

      setFormData((prev) => ({
        ...prev,
        pic: file,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!formData.pic) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formData.pic);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.pic]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("password", formData.password);
    fd.append("phone", formData.phone);

    if (formData.dob) {
      fd.append("dateOfBirth", formData.dob);
    }
    if (formData.occupation.trim()) {
      fd.append("occupation", formData.occupation.trim());
    }
    if (formData.pic) {
      fd.append("profilepic", formData.pic);
    }
    registerMutate(fd, {
      onSuccess: () => {
        toast.success("Registeration successfull", "you can log in now");
        navigate({ to: ROUTES.LOGIN.path as any });
      },
    });
  };

  return (
    <div className="register-page flex w100 aic jcc fdc g12">
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
          <Label className="title-md">A better place to build.</Label>

          <Label className="title-xs">
            Bring your team and your work together.
          </Label>
        </div>

        <form className="register-form g8" onSubmit={handleSubmit}>
          {/* Profile Image */}
          <label className="profile-upload">
            <input
              type="file"
              name="pic"
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
          </label>

          {/* Name */}
          <Input
            name="name"
            value={formData.name}
            label="Full Name:"
            onChange={handleChange}
          />

          {/* DOB + Phone */}
          <div className="flex g8">
            <Input
              name="dob"
              type="date"
              value={formData.dob}
              label="Date Of Birth:"
              onChange={handleChange}
            />

            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              label="Phone No:"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <Input
            name="email"
            type="email"
            value={formData.email}
            label="Work Email:"
            onChange={handleChange}
          />

          {/* Occupation (optional) */}
          <Input
            name="occupation"
            type="text"
            value={formData.occupation}
            label="Occupation (optional):"
            placeholder="e.g. Senior software engineer"
            onChange={handleChange}
          />

          {/* Password */}
          <Input
            name="password"
            type="password"
            value={formData.password}
            label="Password:"
            onChange={handleChange}
          />

          <Button
            type="submit"
            className="register-button flex jcsb "
            loadingLabel="Registering"
            rightIcon={<ArrowRight />}
            isPending={registerIsPending}
          >
            Create an account
          </Button>
          <span>
            Already have an Account?{" "}
            <Link to={ROUTES.LOGIN.path as any}>Login</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;
