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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Memo, useObservable, useValue } from "@legendapp/state/react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "@tanstack/react-router";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const state$ = useObservable({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: undefined as Date | undefined,
  });

  const dateOfBirth$ = useValue(() => state$.dateOfBirth.get());
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Memo>
                  {() => (
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={state$.name.get()}
                      onChange={(event) => state$.name.set(event.target.value)}
                    />
                  )}
                </Memo>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Memo>
                  {() => (
                    <Input
                      id="email"
                      type="email"
                      value={state$.email.get()}
                      onChange={(event) => state$.email.set(event.target.value)}
                      placeholder="m@example.com"
                      required
                    />
                  )}
                </Memo>
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Memo>
                  {() => (
                    <Input
                      id="phone"
                      type="tel"
                      value={state$.phone.get()}
                      onChange={(event) => state$.phone.set(event.target.value)}
                      placeholder="9876543212"
                      required
                    />
                  )}
                </Memo>
              </Field>
              <Field>
                <FieldLabel htmlFor="date-of-birth">Date Of Birth</FieldLabel>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        data-empty={!dateOfBirth$}
                        className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                      />
                    }
                  >
                    <CalendarIcon />
                    {dateOfBirth$ ? (
                      format(dateOfBirth$, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth$}
                      onSelect={(value) => state$.dateOfBirth.set(value)}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Memo>
                    {() => (
                      <Input
                        id="password"
                        type="password"
                        placeholder="*******"
                        value={state$.password.get()}
                        onChange={(event) =>
                          state$.password.set(event.target.value)
                        }
                        required
                      />
                    )}
                  </Memo>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Sign in</Link>
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
