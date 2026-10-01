import type { MyToastContent } from "./toast.types";
import "./style.scss";
import { Button } from "../Button/Button";
interface Props {
  toast: MyToastContent;
  
  onClose: () => void;
}

export default function Toast({ toast, onClose }: Props) {
  return (
    <div className={`toast ${toast.type} ${
    !toast.visible ? "leaving" : ""
  }`}>
      <div>
        {toast.title && <strong>{toast.title}</strong>}
        {toast.description && <p>{toast.description}</p>}
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
