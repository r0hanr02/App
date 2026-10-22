import React, { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./style.scss";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  wrapperClassName?: string;
}


export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon,
      error,
      className = "",
      wrapperClassName = "",
      id,
      type,
      ...inputProps
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    const isPasswordField = type === "password";
    const resolvedType = isPasswordField && isPasswordVisible ? "text" : type;

    return (
      <div className={["ui-input", wrapperClassName].filter(Boolean).join(" ")}>
        {label && (
          <label className="ui-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}

        <div className={["ui-input__field", icon ? "ui-input__field--has-icon" : "", error ? "ui-input__field--error" : "", isPasswordField ? "ui-input__field--has-toggle" : ""].filter(Boolean).join(" ")}>
          {icon && (
            <span className="ui-input__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={["ui-input__control", className].filter(Boolean).join(" ")}
            aria-invalid={!!error}
            {...inputProps}
          />
          {isPasswordField && (
            <button
              type="button"
              className="ui-input__toggle"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              aria-pressed={isPasswordVisible}
              title={isPasswordVisible ? "Hide password" : "Show password"}
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && <p className="ui-input__error">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
