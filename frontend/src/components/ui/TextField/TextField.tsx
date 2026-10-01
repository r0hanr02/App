import {
  Input,
  TextField as AriaTextField,
  TextArea as AriaTextArea,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from "react-aria-components/TextField";
import { Label, FieldError, Description } from "../Form/Form";
import type React from "react";
import "../TextField/style.scss";

export interface TextFieldProps<
  T = HTMLInputElement,
> extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  inputRef?: React.Ref<T>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  onChange,
  inputRef,
  leftIcon,
  rightIcon,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField {...props}>
      {label && <Label className="">{label}</Label>}
      <div
        className={`input-wrapper ${
          leftIcon ? "has-left-icon" : ""
        } ${rightIcon ? "has-right-icon" : ""}`}
      >
        {leftIcon && <div className="input-icon left">{leftIcon}</div>}
        <Input
          ref={inputRef}
          className={({ isInvalid }) =>
            `react-aria-Input inset ${isInvalid ? "input-error" : ""}`
          }
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
          placeholder={placeholder}
        />
        {rightIcon && <div className="input-icon right">{rightIcon}</div>}
      </div>
      {description && <Description>{description}</Description>}
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </AriaTextField>
  );
}

export function TextArea({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  ...props
}: TextFieldProps<HTMLTextAreaElement>) {
  return (
    <AriaTextField {...props}>
      <Label>{label}</Label>
      <AriaTextArea
        ref={inputRef}
        className="react-aria-TextArea inset"
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </AriaTextField>
  );
}
