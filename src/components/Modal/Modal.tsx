import { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  title: string;
  children: ReactNode;
  submitButtonText?: string;
  submitButtonVariant?: 'primary' | 'danger';
  showCancelButton?: boolean;
  cancelButtonText?: string;
  onCancel?: () => void;
  additionalButton?: {
    text: string;
    variant: 'primary' | 'danger' | 'secondary';
    onClick: () => void;
  };
  isReadOnly?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitButtonText = 'Добавить',
  submitButtonVariant = 'primary',
  showCancelButton = true,
  cancelButtonText = 'Отменить',
  additionalButton,
  isReadOnly
}: ModalProps) => {
  const handleOverlayClick = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  if (!isOpen) return null;

  const getButtonClass = (variant: string) => {
    switch (variant) {
      case 'danger':
        return 'btn-danger';
      case 'secondary':
        return 'btn-secondary';
      case 'primary':
      default:
        return 'btn-primary';
    }
  };

  return (
    <div className="modal-overlay" onPointerDown={handleOverlayClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-wrapper'>
            {children}
          </div>

          <div className="modal-actions">
            {!isReadOnly && (
              <div className="action-buttons">
                {showCancelButton && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onClose}
                  >
                    {cancelButtonText}
                  </button>
                )}

                {additionalButton && (
                  <button
                    type="button"
                    className={getButtonClass(additionalButton.variant)}
                    onClick={additionalButton.onClick}
                  >
                    {additionalButton.text}
                  </button>
                )}

                <button
                  type="submit"
                  className={getButtonClass(submitButtonVariant)}
                >
                  {submitButtonText}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};