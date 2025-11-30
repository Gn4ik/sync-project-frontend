import { useState, useEffect, useRef } from 'react';
import { Modal } from '@components/Modal/Modal';
import { Employee, ProjectItem } from '@components/types';
import './TaskModal.css';
import { SuccessModal } from '@components/SuccessModal/SuccessModal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => Promise<boolean>;
  onDelete: (taskId: number) => void;
  mode?: 'create' | 'edit' | 'delete';
  initialData?: any;
  employees: Employee[];
  projects: ProjectItem[];
}

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  mode = 'create',
  initialData,
  employees,
  projects
}: TaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignee: '',
    end_date: '',
    description: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showDeleteConfirm = mode === 'delete';

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
        project: initialData.project_id?.toString() || '',
        assignee: initialData.executor_id?.toString() || '',
        end_date: formatDateForInput(initialData.end_date) || '',
        description: initialData.description || '',
      });

      if (initialData.files) {
        setFiles(initialData.files.map((file: any) => ({
          id: file.id,
          name: file.name,
          url: file.url
        })));
      }
    } else if (isOpen) {
      setFormData({
        title: '',
        project: '',
        assignee: '',
        end_date: '',
        description: '',
      });
      setFiles([]);
      setIsSuccess(false);
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles: File[] = Array.from(selectedFiles);
      setFiles(prev => [...prev, ...newFiles]);
    }
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    let success = false;

    if (mode === 'edit') {
      const taskData = {
        id: initialData ? initialData.id : 0,
        name: formData.title,
        description: formData.description,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : '',
        project_id: parseInt(formData.project) || 0,
        executor_id: parseInt(formData.assignee) || 0
      };
      await onSubmit(taskData, 'task');
    } else if (mode === 'create') {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('project_id', formData.project);
      formDataToSend.append('executor_id', formData.assignee);
      formDataToSend.append('status_id', '0');

      const startDate = new Date().toLocaleDateString('en-CA');
      formDataToSend.append('start_date', startDate);
      files.forEach((file, index) => {
        formDataToSend.append('files', file);
      });

      success = await onSubmit(formDataToSend, 'task');
    }

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

  const handleDelete = () => {
    onDelete(initialData.id);
  }

  const getSuccessMessage = () => {
    if (mode === 'edit') return 'Задача успешно обновлена!';
    return 'Задача успешно создана!';
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const title = mode === 'edit' ? 'Редактировать задачу' : 'Создать задачу';

  if (showDeleteConfirm) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleDelete}
        title="Удаление задачи"
        submitButtonText="Удалить"
        submitButtonVariant="danger"
        showCancelButton={true}
        cancelButtonText="Отменить"
      >
        <div style={{ padding: '10px 10px' }}>
          <p style={{ fontSize: '16px', margin: 0 }}>
            Вы уверены, что хотите удалить задачу "{initialData?.name}"? Это действие нельзя отменить!
          </p>
        </div>
      </Modal>
    );
  }

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
      title={title}
      submitButtonText={mode === 'edit' ? 'Сохранить' : 'Добавить'}
    >
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Название:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите название задачи"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Проект:</label>
          <select
            className="form-select form-text"
            value={formData.project}
            onChange={(e) => handleChange('project', e.target.value)}
            required
          >
            <option value="" disabled hidden>Выберите проект</option>
            {projects.map(project => (
              <option key={project.id} value={project.id} className='form-select-item'>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Исполнитель:</label>
          <select
            className="form-select form-text"
            value={formData.assignee}
            onChange={(e) => handleChange('assignee', e.target.value)}
            required
          >
            <option value="" disabled hidden className='form-text'>Выберите исполнителя</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id} className='form-select-item'>
                {employee.fname} {employee.lname} - {employee.position}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Срок:</label>
          <input
            type="date"
            className="form-input form-text"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            required
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

        {mode === 'create' && (
          <div className="file-upload-section">
            <label className="form-label description-label">Файлы:</label>
            <div className="file-upload-area">
              <button
                type="button"
                className="file-upload-button"
                onClick={triggerFileInput}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Добавить файл
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <button
                      type="button"
                      className="file-remove-button"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};