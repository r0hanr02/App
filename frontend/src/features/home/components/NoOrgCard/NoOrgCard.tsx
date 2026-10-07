import { createElement, isValidElement } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import "./style.scss";
import { Button } from "../../../../components/ui/Button/Button";
import { Label } from "../../../../components/ui/Form/Form";

const renderIcon = (icon: LucideIcon | React.ReactNode) => {
  if (isValidElement(icon)) return icon;
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null && "$$typeof" in icon)
  ) {
    return createElement(icon as LucideIcon);
  }

  return icon;
};

const NoOrgCard = ({
  logo,
  title,
  subheading,
  btnText,
  btnOnclick,

  btnVariant,
  btnlogo,
  note,
}: {
  logo: LucideIcon | React.ReactNode;
  title: string;
  subheading: string;
  btnText: string;
  btnOnclick: () => void;
  btnVariant: "primary" | "secondary" | "outline" | "ghost" | "danger";
  btnlogo?: LucideIcon | React.ReactNode;
  note: string;
}) => {
  return (
    <div className="no-org-card ">
      <div className="no-org-option-icon">{renderIcon(logo)}</div>
      <div className="no-org-option-text flex fdc g4">
        <Label className="title-sm">{title}</Label>
        <Label className="para-sm">{subheading}</Label>
      </div>
      <Button
        className="button primary"
        variant={btnVariant}
        leftIcon={btnlogo}
        onClick={btnOnclick}
        size="lg"
        
      >
        {btnText}
        <ArrowRight size={15} />
      </Button>
      <Label>{note}</Label>
    </div>
  );
};

export default NoOrgCard;
