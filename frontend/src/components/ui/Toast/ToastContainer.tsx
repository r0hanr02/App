import { toast } from "./toast.api";
import Toast from "./Toast";
import "./style.scss";
import { useStore } from "../../../store/store";

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);

  return (
    <div className="toast-container">
      {toasts.map((item) => (
        <Toast
          key={item.id}
          toast={item}
          onClose={() => toast.dismiss(item.id)}
        />
      ))}
    </div>
  );
}
