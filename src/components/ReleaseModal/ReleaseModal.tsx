import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';
import { SuccessModal } from '@components/SuccessModal/SuccessModal';

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => Promise<boolean>;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const ReleaseModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData
}: ReleaseModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    end_date: '',
    description: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
          if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
          if (dateString.includes('T')) return dateString.split('T')[0];
          const date = new Date(dateString);
          return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setFormData({
        name: initialData.name || '',
        version: initialData.version || '',
        end_date: formatDateForInput(initialData.end_date) || '',
        description: initialData.description || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        version: '',
        end_date: '',
        description: '',
      });
      setIsSuccess(false);
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const DataToSend = {
      ...formData,
      status_id: 0
    };

    const success = await onSubmit(DataToSend, 'release');

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 5000);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const getSuccessMessage = () => {
    if (mode === 'edit') return 'Релиз успешно обновлен!';
    return 'Релиз успешно создан!';
  };

  const name = mode === 'edit' ? 'Редактировать релиз' : 'Создать релиз';

  if (isSuccess) {
    return (
      <SuccessModal
        isOpen={isOpen}
        handleSuccessClose={handleSuccessClose}
        message={getSuccessMessage}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={name}
      submitButtonText={mode === 'edit' ? 'Сохранить' : 'Добавить'}
    >
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Название:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите название релиза"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Версия:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите версию"
            value={formData.version}
            onChange={(e) => handleChange('version', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Срок:</label>
          <input
            type="date"
            className="form-input form-text"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group-description">
        <label className="form-label description-label">Описание:</label>
        <textarea
          className="form-textarea form-text"
          placeholder="Введите описание"
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
    </Modal>
  );
};