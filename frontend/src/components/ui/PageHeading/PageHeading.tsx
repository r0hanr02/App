import { Plus } from "lucide-react";
import { Button } from "../Button/Button";
import "./style.scss";

export default function PageHeading({
  topPara,
  title,
  subtitle,
  action,
  onAction,
}: {
  topPara?: string;
  title: string;
  subtitle: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="page-heading">
      <div>
        {topPara && <p className="eyebrow subheading-xs">{topPara}</p>}
        <h1 className="title-lg">{title}</h1>
        <p className="para-sm org-muted">{subtitle}</p>
      </div>
      {action && (
        <div className="heading-actions">
          <Button variant="primary" onPress={onAction} leftIcon={<Plus size={15} />}>
            {action}
          </Button>
        </div>
      )}
    </div>
  );
}
