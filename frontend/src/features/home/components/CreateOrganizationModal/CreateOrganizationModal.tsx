import { Modal } from "../../../../components/ui/Modal/Modal";


const CreateOrganizationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} 
    >
      Create Organization Modal
    </Modal>
  );
};

export default CreateOrganizationModal;
