import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';
import { ReleaseItem, Status } from '@components/types';
import { SuccessModal } from '@components/SuccessModal/SuccessModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => Promise<boolean>;
  mode?: 'create' | 'edit';
  initialData?: any;
  releases: ReleaseItem[]
  statuses?: Status[];
  userRole?: string | null;
}

export const ProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
  releases,
  statuses,
  userRole
}: ProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    release_id: '',
    description: '',
    status_id: '',
    id: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const getProjectId = (string: string) => {
    return string.split('-')[1];
  }

  useEffect(() => {
    const canEdit = userRole === 'admin' || userRole === 'manager';
    setIsViewMode(!canEdit && mode === 'edit');

    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        name: initialData.title || '',
        release_id: String(initialData.data.release_id),
        description: initialData.data.description || '',
        status_id: initialData.data.status?.id?.toString() || '',
        id: getProjectId(initialData.id) || ''
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        release_id: '',
        description: '',
        id: '',
        status_id: ''
      });
      setIsSuccess(false);
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    if (isViewMode) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    let DataToSend;
    if (mode === 'edit') {
      DataToSend = {
        name: formData.name,
        description: formData.description,
        id: formData.id,
        release_id: parseInt(formData.release_id) || 0,
        status_id: parseInt(formData.status_id)
      };
    } else {
      DataToSend = {
        ...formData,
        release_id: parseInt(formData.release_id) || 0,
        status_id: 0
      };
    }

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
            readOnly={isViewMode}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Релиз:</label>
          <select
            className="form-select form-text"
            value={formData.release_id}
            onChange={(e) => handleChange('release_id', e.target.value)}
            required
            disabled={isViewMode}
          >
            <option value="" disabled hidden>Выберите релиз</option>
            {releases.map(release => (
              <option key={release.id} value={String(release.id)} className='form-select-item'>
                {release.name}
              </option>
            ))}
          </select>
        </div>

        {mode === 'edit' && (
          <div className='form-group'>
            <label className='form-label'>Статус:</label>
            <select
              className="form-select form-text"
              value={formData.status_id}
              onChange={(e) => handleChange('status_id', e.target.value)}
              required
              disabled={isViewMode}
            >
              <option value="" disabled hidden>Выберите статус</option>
              {statuses?.map(status => (
                <option key={status.id} value={status.id} className='form-select-item'>
                  {status.alias}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="form-group-description">
        <label className="form-label description-label">Описание:</label>
        <textarea
          className="form-textarea form-text"
          placeholder="Введите описание"
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          readOnly={isViewMode}
        />
      </div>
    </Modal>
  );
};