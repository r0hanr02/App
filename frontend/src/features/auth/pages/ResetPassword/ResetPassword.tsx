import "./style.scss";
import { ArrowRight, Layers } from "lucide-react";
import { Form, Label } from "../../../../components/ui/Form/Form";
import Input from "../../../../components/ui/Input/Input";
import { Button } from "../../../../components/ui/Button/Button";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ROUTES } from "../../../../constants/routes.constants";
import { useState } from "react";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useResetPassword } from "../../api/resetPassword.api";

const MIN_PASSWORD_LENGTH = 8;

const getTokenFromSearch = (search: unknown): string | null => {
  if (!search || typeof search !== "object") return null;
  const token = (search as Record<string, unknown>).token;
  return typeof token === "string" && token.length > 0 ? token : null;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const token = getTokenFromSearch(search);

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const { mutate: resetMutate, isPending } = useResetPassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    resetMutate(
      { token: token ?? undefined, password: formData.password },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          void navigate({ to: ROUTES.LOGIN.path as any });
        },
      },
    );
  };

  return (
    <div className="reset-password-page flex w100 aic jcc fdc g12">
      <div className="flex aic jcc g12">
        <Layers size={30} color="var(--accent)" />
        <Label className="title-lg">orbit.</Label>
      </div>

      <div className="register g8">
        <div className="register-logo">
          <Layers size={30} color="var(--accent)" />
        </div>

        <div className="flex fdc g8">
          <Label className="title-md">Reset your password</Label>
          <Label className="title-xs">
            Choose a new password for your account.
          </Label>
        </div>

        {!token && (
          <p className="reset-password-page__notice">
            This page was opened without a reset link. Open the link from your
            email, or{" "}
            <Link to={ROUTES.FORGETPASSWORD.path as any}>
              request a new one
            </Link>
            .
          </p>
        )}

        <Form className="register-form g8" onSubmit={handleSubmit}>
          <Input
            name="password"
            type="password"
            value={formData.password}
            label="New Password:"
            placeholder="Enter new password"
            autoComplete="new-password"
            onChange={handleChange}
          />

          <Input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            label="Confirm Password:"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            error={error ?? undefined}
            onChange={handleChange}
          />

          <Button
            type="submit"
            className="register-button flex jcsb"
            loadingLabel="Resetting"
            isPending={isPending}
            rightIcon={<ArrowRight />}
          >
            Reset password
          </Button>

          <span>
            Remember your password?{" "}
            <Link to={ROUTES.LOGIN.path as any}>Back to login</Link>
          </span>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
