import { useState } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  type: 'release' | 'project' | 'task';
}

const Modal = ({ isOpen, onClose, onSubmit, type }: ModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignee: '',
    deadline: '',
    description: '',
    link: '',
    version: ''
  });

  const modalTitles = {
    release: 'Создать релиз',
    project: 'Создать проект',
    task: 'Создать задачу'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type: type
    });
    onClose();
    setFormData({
      title: '',
      project: '',
      assignee: '',
      deadline: '',
      description: '',
      link: '',
      version: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Заголовок */}
        <div className="modal-header">
          <h2 className="modal-title">{modalTitles[type]}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Основная форма */}
          <div className='form-wrapper'>
            <div className="form-section">

              {/* Название */}
              <div className="form-group">
                <label className="form-label">Название:</label>
                <input
                  type="text"
                  className="form-input form-text"
                  placeholder={`Введите название ${type === 'release' ? 'релиза' : type === 'project' ? 'проекта' : 'задачи'}`}
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              {/* Для задач и проектов - выбор родительского элемента */}
              {(type === 'task' || type === 'project') && (
                <div className="form-group">
                  <label className="form-label">
                    {type === 'task' ? 'Проект:' : 'Релиз:'}
                  </label>
                  <select
                    className="form-select form-text"
                    value={formData.project}
                    onChange={(e) => handleChange('project', e.target.value)}
                    required={type === 'task'}
                  >
                    <option value="" disabled hidden>
                      {type === 'task' ? 'Выберите проект' : 'Выберите релиз'}
                    </option>
                    <option value="project1" className='form-text'>data1</option>
                    <option value="project2" className='form-text'>data2</option>
                    <option value="project3" className='form-text'>data3</option>
                  </select>
                </div>
              )}

              {type === "project" && (
                <div className="form-group">
                  <label className="form-label">Ссылка:</label>
                  <input
                    type="text"
                    className="form-input form-text"
                    placeholder={`Введите ссылку на проект`}
                    value={formData.link}
                    onChange={(e) => handleChange('link', e.target.value)}
                    required
                  />
                </div>
              )}

              {type === "release" && (
                <div className="form-group">
                  <label className="form-label">Версия:</label>
                  <input
                    type="text"
                    className="form-input form-text"
                    placeholder={`Введите версию`}
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Для задач - исполнитель */}
              {type === 'task' && (
                <div className="form-group">
                  <label className="form-label">Исполнитель:</label>
                  <select
                    className="form-select form-text"
                    value={formData.assignee}
                    onChange={(e) => handleChange('assignee', e.target.value)}
                    required
                  >
                    <option value="" disabled hidden className='form-text'>Выберите исполнителя</option>
                    <option value="assignee1" className='form-text'>Исполнитель 1</option>
                    <option value="assignee2" className='form-text'>Исполнитель 2</option>
                    <option value="assignee3" className='form-text'>Исполнитель 3</option>
                  </select>
                </div>
              )}

              {/* Срок (для всех типов) */}
              <div className="form-group">
                <label className="form-label">Срок:</label>
                <input
                  type="date"
                  className="form-input form-text"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  required={type === 'task'}
                />
              </div>
            </div>

            {/* Описание */}
            <div className="form-group-description ">
              <label className="form-label description-label">Описание:</label>
              <textarea
                className="form-textarea form-text "
                placeholder="Введите описание"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="modal-actions">
            <div className="action-buttons">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Отменить
              </button>
              <button type="submit" className="btn-primary">
                Добавить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;