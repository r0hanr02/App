import { Modal } from "../../../../components/ui/Modal/Modal";
import "./style.scss";
const ProjectModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      TaskModal
    </Modal>
  );
};

export default ProjectModal;
