import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
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
    title: '',
    version: '',
    end_date: '',
    description: '',
  });

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
        title: initialData.name || '',
        version: initialData.version || '',
        end_date: formatDateForInput(initialData.end_date) || '',
        description: initialData.description || '',
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        version: '',
        end_date: '',
        description: '',
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      type: 'release'
    });
  };

  const title = mode === 'edit' ? 'Редактировать релиз' : 'Создать релиз';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      submitButtonText={mode === 'edit' ? 'Сохранить' : 'Добавить'}
    >
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Название:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите название релиза"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
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