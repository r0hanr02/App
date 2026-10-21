import "./style.scss";
import { ArrowRight, Layers } from "lucide-react";
import { Form, Label } from "../../../../components/ui/Form/Form";
import Input from "../../../../components/ui/Input/Input";
import { Button } from "../../../../components/ui/Button/Button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../../constants/routes.constants";
import { useState } from "react";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useForgetPassword, useResetPassword } from "../../api/forgetPassword.api";

const MIN_PASSWORD_LENGTH = 8;

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate: forgetMutate, isPending: forgetIsPending } =
    useForgetPassword();
  const { mutate: resetMutate, isPending: resetIsPending } = useResetPassword();

  const stepper = [
    {
      title: "Forgot your password?",
      subtitle: "We’ll send you a link to get back into your account.",
    },
    {
      title: "Reset your password",
      subtitle: "Choose a new password for your account.",
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendResetLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (forgetIsPending) return;

    if (!formData.email.trim()) {
      setError("Work email is required");
      return;
    }

    forgetMutate(
      { email: formData.email.trim() },
      {
        onSuccess: (res) => {
          toast.success(res.message, "Check your inbox to continue");
          setSteps(1);
        },
      },
    );
  };

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resetIsPending) return;

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    resetMutate(
      { password: formData.password },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          void navigate({ to: ROUTES.LOGIN.path as any });
        },
      },
    );
  };

  const isPending = steps === 0 ? forgetIsPending : resetIsPending;

  return (
    <div className="forget-password-page flex w100 aic jcc fdc g12">
      <div className="flex aic jcc g12">
        <Layers size={30} color="#6366F1" />
        <Label className="title-lg">orbit.</Label>
      </div>

      <div className="register g8">
        <div className="register-logo">
          <Layers size={30} color="#6366F1" />
        </div>

        <div className="flex fdc g8">
          <Label className="title-md">{stepper[steps].title}</Label>

          <Label className="title-xs">{stepper[steps].subtitle}</Label>
        </div>

        <div className="forget-password-steps flex aic g4">
          {stepper.map((_, index) => (
            <span
              key={index}
              className={`forget-password-steps__dot${
                index <= steps ? " is-active" : ""
              }`}
            />
          ))}
        </div>

        {steps === 0 ? (
          <Form
            className="register-form g8"
            onSubmit={handleSendResetLink}
          >
            {/* Email */}
            <Input
              name="email"
              type="email"
              value={formData.email}
              label="Work Email:"
              placeholder="Enter Your Work Email"
              autoComplete="email"
              error={error ?? undefined}
              onChange={handleChange}
            />
            <Button
              type="submit"
              className="register-button flex jcsb"
              loadingLabel="Sending"
              isPending={forgetIsPending}
              rightIcon={<ArrowRight />}
            >
              Send reset link
            </Button>
            <span>
              Remember your password?{" "}
              <Link to={ROUTES.LOGIN.path as any}>Back to login</Link>
            </span>
          </Form>
        ) : (
          <Form
            className="register-form g8"
            onSubmit={handleResetPassword}
          >
            {/* New password */}
            <Input
              name="password"
              type="password"
              value={formData.password}
              label="New Password:"
              placeholder="Enter new password"
              autoComplete="new-password"
              onChange={handleChange}
            />

            {/* Confirm password */}
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
              isPending={resetIsPending}
              rightIcon={<ArrowRight />}
            >
              Reset password
            </Button>
            <span>
              Remember your password?{" "}
              <Link to={ROUTES.LOGIN.path as any}>Back to login</Link>
            </span>
          </Form>
        )}

        {steps === 1 && (
          <button
            type="button"
            className="forget-password-back"
            onClick={() => {
              setError(null);
              setSteps(0);
            }}
            disabled={isPending}
          >
            Use a different email
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
