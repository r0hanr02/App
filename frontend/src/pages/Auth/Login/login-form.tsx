import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Memo, useObservable } from "@legendapp/state/react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const state$ = useObservable({
    email: "",
    password: "",
  });

  const handleLogin = () => {
    console.log("States:: ", `${state$.email.get()} ${state$.password.get()}`);
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login to your Organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Memo>
                  {() => (
                    <Input
                      id="email"
                      value={state$.email.get()}
                      onChange={(event) => state$.email.set(event.target.value)}
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  )}
                </Memo>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to={"/forget-password"}
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Memo>
                  {() => (
                    <Input
                      id="password"
                      type="password"
                      required
                      value={state$.password.get()}
                      onChange={(event) =>
                        state$.password.set(event.target.value)
                      }
                    />
                  )}
                </Memo>
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link to={"/register"}>Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link to={"/terms-of-service"}>Terms of Service</Link> and{" "}
        <Link to={"/privacy-policy"}>Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
