import { initialsOf } from "../../utils/home.utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md";
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  return (
    <span
      className={size === "sm" ? "avatar avatar-small" : "avatar"}
      aria-hidden="true"
      title={name}
    >
      {initialsOf(name)}
    </span>
  );
}

export default Avatar;
