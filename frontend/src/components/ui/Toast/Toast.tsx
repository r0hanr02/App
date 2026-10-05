import type { MyToastContent } from "./toast.types";
import "./style.scss";
import { Button } from "../Button/Button";
import { Label } from "../Form/Form";
interface Props {
  toast: MyToastContent;

  onClose: () => void;
}

export default function Toast({ toast, onClose }: Props) {
  return (
    <div className={`toast ${toast.type} ${!toast.visible ? "leaving" : ""}`}>
      <div className="flex fdc">
        {toast.title && <Label className="label-lg">{toast.title}</Label>}
        {toast.description && (
          <Label className="label-md">{toast.description}</Label>
        )}
        {toast.children}
      </div>

      {toast.showClose !== false && (
        <Button variant="secondary" onClick={onClose}>
          ✕
        </Button>
      )}
    </div>
  );
}
