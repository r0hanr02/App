import {
  useCallback,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

type PopoverAlign = "left" | "right";

type PopoverPositionOptions = {
  align?: PopoverAlign;
  gap?: number;
  maxHeight?: number;
  matchAnchorWidth?: boolean;
};

const VIEWPORT_MARGIN = 8;

export const usePopoverPosition = (
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  {
    align = "left",
    gap = 4,
    maxHeight = 280,
    matchAnchorWidth = false,
  }: PopoverPositionOptions = {},
) => {
  const [position, setPosition] = useState<CSSProperties | null>(null);

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - gap - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - gap - VIEWPORT_MARGIN;
    const openUp = spaceBelow < Math.min(maxHeight, spaceAbove);
    const available = Math.max(96, openUp ? spaceAbove : spaceBelow);
    const resolvedMaxHeight = Math.min(maxHeight, available);

    const next: CSSProperties = {
      position: "fixed",
      top: openUp ? "auto" : rect.bottom + gap,
      bottom: openUp ? viewportHeight - rect.top + gap : "auto",
      maxHeight: resolvedMaxHeight,
    };

    if (matchAnchorWidth) {
      const width = Math.min(rect.width, viewportWidth - VIEWPORT_MARGIN * 2);
      next.width = width;
      next.left = Math.min(
        Math.max(rect.left, VIEWPORT_MARGIN),
        viewportWidth - width - VIEWPORT_MARGIN,
      );
      next.right = "auto";
    } else if (align === "right") {
      next.left = "auto";
      next.right = Math.max(VIEWPORT_MARGIN, viewportWidth - rect.right);
    } else {
      next.left = Math.min(
        Math.max(rect.left, VIEWPORT_MARGIN),
        viewportWidth - VIEWPORT_MARGIN,
      );
      next.right = "auto";
    }

    setPosition(next);
  }, [align, anchorRef, gap, matchAnchorWidth, maxHeight]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, update]);

  return position;
};
