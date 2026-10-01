import type { ButtonProps as RACButtonProps } from "react-aria-components";
import type { JSX } from "react";
import type { LucideIcon } from "lucide-react";

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

export interface ButtonProps extends RACButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?:  JSX.ElementType | LucideIcon;
  rightIcon?:  JSX.ElementType | LucideIcon;
  loadingLabel?: string;
  loadingColor?: string;
  fullWidth?: boolean;
}