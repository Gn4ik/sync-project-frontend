import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';
import { ReleaseItem } from '@components/types';
import { SuccessModal } from '@components/SuccessModal/SuccessModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => Promise<boolean>;
  mode?: 'create' | 'edit';
  initialData?: any;
  releases: ReleaseItem[]
}

export const ProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
  releases
}: ProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    release_id: '',
    description: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      // const formatDateForInput = (dateString: string) => {
      //   if (!dateString) return '';
      //   try {
      //     if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
      //     if (dateString.includes('T')) return dateString.split('T')[0];
      //     const date = new Date(dateString);
      //     return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
      //   } catch {
      //     return '';
      //   }
      // };

      setFormData({
        name: initialData.name || '',
        link: initialData.link || '',
        release_id: initialData.release_id || '',
        description: initialData.description || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        link: '',
        release_id: '',
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

    const success = await onSubmit(DataToSend, 'project');

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
    if (mode === 'edit') return 'Проект успешно обновлен!';
    return 'Проект успешно создан!';
  };

  const name = mode === 'edit' ? 'Редактировать проект' : 'Создать проект';

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
            placeholder="Введите название проекта"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        {/* <div className="form-group">
          <label className="form-label">Ссылка:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите ссылку на проект"
            value={formData.link}
            onChange={(e) => handleChange('link', e.target.value)}
            required
          />
        </div> */}

        <div className="form-group">
          <label className="form-label">Релиз:</label>
          <select
            className="form-select form-text"
            value={formData.release_id}
            onChange={(e) => handleChange('release_id', e.target.value)}
            required
          >
            <option value="" disabled hidden>Выберите релиз</option>
            {releases.map(release => (
              <option key={release.id} value={release.id} className='form-select-item'>
                {release.name}
              </option>
            ))}
          </select>
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