import React, { useEffect, useRef, useState } from "react";
import { usePopoverPosition } from "../../../hooks/usePopoverPosition";
import "./style.scss"

export interface ThreeDotMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
}

export interface MenuProps {
  items: ThreeDotMenuItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
  ariaLabel?: string;
  className?: string;
}


export const ThreeDotMenu: React.FC<MenuProps> = ({
  items,
  trigger,
  align = "right",
  ariaLabel = "More actions",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listPosition = usePopoverPosition(rootRef, open, { align });

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleItemClick = (item: ThreeDotMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={["ui-menu", open ? "ui-menu--open" : "", className].filter(Boolean).join(" ")}
      
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="ui-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger ?? "⋮"}
      </button>

      {open && (
        <ul
          className={`ui-menu__list ui-menu__list--${align}`}
          role="menu"
          style={listPosition ?? { visibility: "hidden" }}
        >
          {items.map((item) => (
            <React.Fragment key={item.key}>
              {item.dividerBefore && <li className="ui-menu__divider" role="separator" />}
              <li
                role="menuitem"
                aria-disabled={item.disabled}
                className={[
                  "ui-menu__item",
                  item.danger ? "ui-menu__item--danger" : "",
                  item.disabled ? "ui-menu__item--disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && <span className="ui-menu__item-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </li>
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThreeDotMenu;