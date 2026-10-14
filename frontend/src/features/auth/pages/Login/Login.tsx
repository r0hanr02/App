import { Layers } from "lucide-react";
import { Label } from "../../../../components/ui/Form/Form";
import "./style.scss";
import { Input } from "../../../../components/ui/Input/Input";
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/Button/Button";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useLoginUser } from "../../api/login.api";
import { useStore } from "../../../../store/store";
import { ROUTES } from "../../../../constants/routes.constants";
import { queryClient } from "../../../../lib/queryClient";
import { userOrganizationQueryOptions } from "../../../home/api/home.api";

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const { mutate: loginMutate, isPending: loginIsPending } = useLoginUser();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  // const userData = useStore((s)=>s.data)
  // HOME is org-scoped ("/$orgSlug") — resolve the slug before navigating.
  const goHomeWithOrg = async () => {
    try {
      const res = await queryClient.ensureQueryData(
        userOrganizationQueryOptions,
      );
      const slug = res.data?.[0]?.organization_id?.slug;
      if (slug) {
        await navigate({
          to: "/$orgSlug" as never,
          params: { orgSlug: slug } as never,
        });
      } else {
        await navigate({ to: ROUTES.NOORGANIZATION.path });
      }
    } catch {
      await navigate({ to: ROUTES.NOORGANIZATION.path });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginIsPending) return;
    loginMutate(formData, {
      onSuccess: (res) => {
        toast.success("Login successful");
        useStore.getState().setData(res);
        void goHomeWithOrg();
      },
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      void goHomeWithOrg();
    }
  }, []);

  return (
    <div className="login-page flex w100 aic jcc fdc g12">
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
          <Label className="title-md">Welcome back.</Label>

          <Label className="title-xs">Your next great idea starts here.</Label>
        </div>

        <form className="register-form g8" onSubmit={handleSubmit}>
          {/* Email */}
          <Input
            name="email"
            type="email"
            value={formData.email}
            label="Work Email:"
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
            className="register-button"
            loadingLabel="Registering"
            isPending={loginIsPending}
          >
            Login
          </Button>
          <span>
            New to Orbit? <Link to={"/register"}>Create an Account</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
