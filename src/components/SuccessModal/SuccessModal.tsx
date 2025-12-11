import { Modal } from "@components/Modal/Modal";
import './SuccessModal.css';

interface SuccessModalProps {
  message: () => string;
  isOpen: boolean;
  handleSuccessClose: () => void;
}

export const SuccessModal = ({ message, isOpen, handleSuccessClose }: SuccessModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSuccessClose}
      onSubmit={handleSuccessClose}
      title="Успех!"
      submitButtonText="OK"
      showCancelButton={false}
      data-testid="success-modal"
    >
      <div className="success-modal-content" data-testid="success-modal-content">
        <div className="success-modal-icon" data-testid="success-modal-icon">
          ✓
        </div>
        <p className="success-modal-message" data-testid="success-modal-message">
          {message()}
        </p>
      </div>
    </Modal>
  );
}