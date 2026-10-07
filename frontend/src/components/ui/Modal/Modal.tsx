import { X, type LucideIcon } from "lucide-react";
import "./Style.scss";
import {
  Dialog,
  ModalOverlay,
  Modal as RACModal,
} from "react-aria-components";
import type {
  ComponentType,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
  SVGProps,
} from "react";
import { Button } from "../Button/Button";
import type { ButtonVariant } from "../Button/button.type";

type RenderableIcon =
  | ReactElement
  | ElementType
  | LucideIcon
  | ComponentType<SVGProps<SVGSVGElement>>;

// types
type ActionButton = {
  text?: string;
  iconLeft?: RenderableIcon;
  iconRight?: RenderableIcon;
  onPress?: () => void;
  style?: CSSProperties;
  hidden?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
};

type HeaderConfig = {
  hidden?: boolean;
  title?: string;
  description?: string;
  icon?: RenderableIcon;
  closeButton?: boolean;
  custom?: ReactNode;
};

type FooterConfig = {
  hidden?: boolean;
  custom?: ReactNode;
  link?: ReactNode;
  dismiss?: ActionButton;
  submit?: ActionButton;
};

export type ModalProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full" | "auto";
  /** Controlled open state. Manage with normal React state: `const [isOpen, setIsOpen] = useState(false)` */
  isOpen: boolean;
  type?: "normal" | "confirm" | "delete" | "success";

  header?: HeaderConfig;
  footer?: FooterConfig;

  closeOnBackdrop?: boolean;
  isSubmitting?: boolean;

  onClose: () => void;

  children: ReactNode;
};

function renderIcon(icon: RenderableIcon | undefined): ReactNode {
  if (!icon) return null;
  if (typeof icon === "function") {
    const Icon = icon as ElementType;
    return <Icon size={18} />;
  }
  return icon as ReactNode;
}

function getDismissVariant(
  type: NonNullable<ModalProps["type"]>,
  custom?: ButtonVariant,
): ButtonVariant {
  if (custom) return custom;
  if (type === "normal") return "secondary";
  return "secondary";
}

function getSubmitVariant(
  type: NonNullable<ModalProps["type"]>,
  custom?: ButtonVariant,
): ButtonVariant {
  if (custom) return custom;
  if (type === "delete") return "danger";
  if (type === "confirm") return "primary";
  if (type === "success") return "primary";
  return "primary";
}

// component — fully controlled with normal React state (isOpen + onClose),
// no external store, no <Show> component.
export function Modal({
  size = "md",
  type = "normal",
  isOpen,
  header,
  footer,
  closeOnBackdrop = true,
  isSubmitting = false,
  onClose,
  children,
  ...rest
}: ModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const showHeader = type === "normal" && !header?.hidden;
  const showFooter = !footer?.hidden;
  const showCloseButton = header?.closeButton !== false;
  const showDismissButton = !footer?.dismiss?.hidden;
  const showSubmitButton = !footer?.submit?.hidden;
  const submitLoading = footer?.submit?.loading ?? isSubmitting;

  return (
    <ModalOverlay
      {...rest}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable={closeOnBackdrop}
      className="ui-modal-overlay"
    >
      <RACModal className={`ui-modal ui-modal--${size}`} data-size={size}>
        <Dialog className="ui-modal__dialog">
          {({ close }) => (
            <>
              {showHeader && (
                <>
                  {header?.custom ? (
                    <div className="ui-modal__header">{header.custom}</div>
                  ) : (
                    <div className="ui-modal__header">
                      <div className="ui-modal__title-group">
                        {header?.icon && (
                          <div className="ui-modal__icon">
                            {renderIcon(header.icon)}
                          </div>
                        )}
                        <div>
                          <div className="ui-modal__title">
                            {header?.title ?? "Login"}
                          </div>
                          {header?.description && (
                            <div className="ui-modal__description">
                              {header.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {showCloseButton && (
                        <Button
                          variant="ghost"
                          onPress={close}
                          className="ui-modal__close"
                          aria-label="Close dialog"
                        >
                          <X size={20} />
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="ui-modal__body">{children}</div>

              {showFooter && (
                <>
                  {footer?.custom ? (
                    <div className="ui-modal__footer">{footer.custom}</div>
                  ) : (
                    <div className="ui-modal__footer">
                      {footer?.link && (
                        <div className="ui-modal__footer-link">
                          {footer.link}
                        </div>
                      )}
                      <div className="ui-modal__footer-actions">
                        {showDismissButton && (
                          <Button
                            style={{ ...footer?.dismiss?.style }}
                            variant={getDismissVariant(
                              type,
                              footer?.dismiss?.variant,
                            )}
                            onPress={footer?.dismiss?.onPress ?? close}
                            className="dismiss-btn"
                            leftIcon={renderIcon(footer?.dismiss?.iconLeft)}
                            rightIcon={renderIcon(footer?.dismiss?.iconRight)}
                          >
                            {footer?.dismiss?.text || "Dismiss"}
                          </Button>
                        )}
                        {showSubmitButton && (
                          <Button
                            onPress={footer?.submit?.onPress}
                            isDisabled={submitLoading}
                            className="submit-btn"
                            variant={getSubmitVariant(
                              type,
                              footer?.submit?.variant,
                            )}
                            style={{ ...footer?.submit?.style }}
                            leftIcon={renderIcon(footer?.submit?.iconLeft)}
                            rightIcon={renderIcon(footer?.submit?.iconRight)}
                          >
                            {submitLoading
                              ? "...Submitting"
                              : (footer?.submit?.text || "Submit")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </Dialog>
      </RACModal>
    </ModalOverlay>
  );
}
