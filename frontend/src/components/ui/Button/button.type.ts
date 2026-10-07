import type { ButtonProps as RACButtonProps } from "react-aria-components";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize =
  | "sm"
  | "md"
  | "lg";

  type ButtonIcon = React.ElementType | React.ReactNode;
export interface ButtonProps extends RACButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ButtonIcon;
  rightIcon?: ButtonIcon;
  loadingLabel?: string;
  loadingColor?: string;
  fullWidth?: boolean;
}