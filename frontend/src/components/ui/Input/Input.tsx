import React, { forwardRef } from "react";
import "./style.scss";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  wrapperClassName?: string;
}


export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", wrapperClassName = "", id, ...inputProps }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className={["ui-input", wrapperClassName].filter(Boolean).join(" ")}>
        {label && (
          <label className="ui-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}

        <div className={["ui-input__field", icon ? "ui-input__field--has-icon" : "", error ? "ui-input__field--error" : ""].filter(Boolean).join(" ")}>
          {icon && (
            <span className="ui-input__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={["ui-input__control", className].filter(Boolean).join(" ")}
            aria-invalid={!!error}
            {...inputProps}
          />
        </div>

        {error && <p className="ui-input__error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;