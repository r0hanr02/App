import "./style.scss";
import { ArrowRight, Layers, MailCheck } from "lucide-react";
import { Form, Label } from "../../../../components/ui/Form/Form";
import Input from "../../../../components/ui/Input/Input";
import { Button } from "../../../../components/ui/Button/Button";
import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../../../constants/routes.constants";
import { useState } from "react";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useForgetPassword } from "../../api/forgetPassword.api";
import Captcha from "../../components/Captcha/Captcha";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { mutate: forgetMutate, isPending } = useForgetPassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setEmail(e.target.value);
  };

  const handleCaptchaChange = (value: string) => {
    setCaptchaError(null);
    setCaptcha(value);
  };

  const sendResetLink = () => {
    if (isPending) return;

    if (!email.trim()) {
      setError("Work email is required");
      return;
    }

    if (!captcha.trim()) {
      setCaptchaError("Captcha answer is required");
      return;
    }

    forgetMutate(
      { email: email.trim(), captcha: captcha.trim() },
      {
        onSuccess: (res) => {
          toast.success(res.message, "Check your inbox to continue");
          setSentTo(email.trim());
          setError(null);
          setCaptchaError(null);
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendResetLink();
  };

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

        {sentTo ? (
          <>
            <div className="flex fdc g8">
              <Label className="title-md">Check your inbox</Label>
              <Label className="title-xs">
                We sent a password reset link to your email.
              </Label>
            </div>

            <div className="forget-password-sent">
              <span className="forget-password-sent__icon">
                <MailCheck size={26} />
              </span>
              <span className="forget-password-sent__email">{sentTo}</span>
              <span className="forget-password-sent__hint">
                The link expires in 15 minutes and can only be used once.
              </span>
            </div>

            <div className="forget-password-actions">
              <Captcha
                value={captcha}
                onChange={handleCaptchaChange}
                error={captchaError ?? undefined}
              />

              <Button
                type="button"
                className="register-button flex jcsb"
                loadingLabel="Sending"
                isPending={isPending}
                onPress={sendResetLink}
              >
                Resend link
              </Button>
              <span>
                Remember your password?{" "}
                <Link to={ROUTES.LOGIN.path as any}>Back to login</Link>
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex fdc g8">
              <Label className="title-md">Forgot your password?</Label>
              <Label className="title-xs">
                We’ll send you a link to get back into your account.
              </Label>
            </div>

            <Form className="register-form g8" onSubmit={handleSubmit}>
              <Input
                name="email"
                type="email"
                value={email}
                label="Work Email:"
                placeholder="Enter Your Work Email"
                autoComplete="email"
                error={error ?? undefined}
                onChange={handleChange}
              />

              <Captcha
                value={captcha}
                onChange={handleCaptchaChange}
                error={captchaError ?? undefined}
              />

              <Button
                type="submit"
                className="register-button flex jcsb"
                loadingLabel="Sending"
                isPending={isPending}
                rightIcon={<ArrowRight />}
              >
                Send reset link
              </Button>

              <span>
                Remember your password?{" "}
                <Link to={ROUTES.LOGIN.path as any}>Back to login</Link>
              </span>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
