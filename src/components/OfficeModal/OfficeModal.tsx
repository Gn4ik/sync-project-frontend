import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';

interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const OfficeModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData
}: OfficeModalProps) => {
  const [formData, setFormData] = useState({
    officeName: '',
    manager: '',
  });

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        officeName: initialData.officeName || initialData.name || '',
        manager: initialData.manager || '',
      });
    } else if (isOpen) {
      setFormData({
        officeName: '',
        manager: '',
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData, 'department');
  };

  const title = mode === 'edit' ? 'Редактировать офис' : 'Добавить офис';
  const submitText = mode === 'edit' ? 'Сохранить' : 'Добавить офис';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      submitButtonText={submitText}
    >
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Название офиса:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите название офиса"
            value={formData.officeName}
            onChange={(e) => handleChange('officeName', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">ФИО руководителя:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите ФИО руководителя"
            value={formData.manager}
            onChange={(e) => handleChange('manager', e.target.value)}
            required
          />
        </div>
      </div>
    </Modal>
  );
};