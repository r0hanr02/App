import React, { useEffect, useRef, useState } from "react";
import { usePopoverPosition } from "../../../hooks/usePopoverPosition";
import "./style.scss";

export interface SelectOption {
  label: string;
  value: string;
}

export interface DropDownProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}


export const DropDown: React.FC<DropDownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ariaLabel,
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listPosition = usePopoverPosition(rootRef, open, {
    matchAnchorWidth: true,
  });

  const selected = options.find((opt) => opt.value === value);

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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={["ui-select", open ? "ui-select--open" : "", disabled ? "ui-select--disabled" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="ui-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ui-select__value">{selected ? selected.label : placeholder}</span>
        <span className="ui-select__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul
          className="ui-select__list"
          role="listbox"
          style={listPosition ?? { visibility: "hidden" }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={["ui-select__option", opt.value === value ? "is-selected" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropDown;