import { useState, useRef, useEffect } from 'react';
import './Modal.css';
import { Colleague, ProjectItem } from '@components/types';

const URL = process.env.HOST;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  type: 'release' | 'project' | 'task' | 'meeting' | 'colleague' | 'office';
  mode?: 'create' | 'edit';
  initialData?: any;
  colleagues: Colleague[];
  projects: ProjectItem[];
}

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  mode = 'create',
  initialData,
  projects,
  colleagues
}: ModalProps) => {

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    position: '',
    department: '',
    office: '',
    email: '',
    phone: '',
    birthDate: '',

    project: '',
    assignee: '',
    end_date: '',
    description: '',
    link: '',
    version: '',

    participants: [] as string[],
    meetingDate: '',
    meetingTime: '',

    officeName: '',
    manager: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return '';
          try {
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              return dateString;
            }
            if (dateString.includes('T')) {
              return dateString.split('T')[0];
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        }
        setFormData({
          title: initialData.name || '',
          name: initialData.lname + initialData.fname + initialData.mname || '',
          position: initialData.position || '',
          department: initialData.department || '',
          office: initialData.office || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          birthDate: initialData.birthDate || '',
          description: initialData.description || '',
          end_date: formatDateForInput(initialData.end_date) || '',
          link: initialData.link || '',
          version: initialData.version || '',
          participants: initialData.participants || [],
          meetingDate: initialData.meetingDate || '',
          meetingTime: initialData.meetingTime || '',
          project: initialData.project_id?.toString() || '',
          assignee: initialData.executor_id?.toString() || '',
          officeName: initialData.officeName || initialData.name || '',
          manager: initialData.manager || ''
        });
      } else {
        setFormData({
          title: '',
          name: '',
          position: '',
          department: '',
          office: '',
          email: '',
          phone: '',
          birthDate: '',
          description: '',
          end_date: '',
          link: '',
          version: '',
          participants: [],
          meetingDate: '',
          meetingTime: '',
          project: '',
          assignee: '',
          officeName: '',
          manager: ''
        });
      }
      setSearchTerm('');
      setShowDropdown(false);
    }
  }, [isOpen, initialData, mode]);

  const modalTitles = {
    release: mode === 'edit' ? 'Редактировать релиз' : 'Создать релиз',
    project: mode === 'edit' ? 'Редактировать проект' : 'Создать проект',
    task: mode === 'edit' ? 'Редактировать задачу' : 'Создать задачу',
    meeting: mode === 'edit' ? 'Редактировать встречу' : 'Создать встречу',
    colleague: mode === 'edit' ? 'Редактировать сотрудника' : 'Добавить сотрудника',
    office: mode === 'edit' ? 'Редактировать офис' : 'Добавить офис'
  };

  const filteredColleagues = colleagues.filter(colleague =>
    colleague.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colleague.mname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colleague.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colleague.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'task') {
      const taskData = {
        id: mode === 'edit' && initialData ? initialData.id : 0,
        name: formData.title,
        description: formData.description,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : '',
        project_id: parseInt(formData.project) || 0,
        executor_id: parseInt(formData.assignee) || 0,
        status_id: mode === 'edit' && initialData ? initialData.status_id : 1
      };

      console.log('Sending task data:', taskData);
      onSubmit(taskData);
    } else {
      onSubmit({
        ...formData,
        type: type
      });
    }
    onClose();
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParticipantToggle = (colleagueId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(colleagueId)
        ? prev.participants.filter(id => id !== colleagueId)
        : [...prev.participants, colleagueId]
    }));
  };

  const getSelectedParticipantsNames = () => {
    return formData.participants.map(id =>
      colleagues.find(c => c.id === id)?.fname + ' ' + colleagues.find(c => c.id === id)?.lname
    ).filter(Boolean).join(', ');
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const getInputDisplayValue = () => {
    if (searchTerm) {
      return searchTerm;
    }
    if (formData.participants.length > 0) {
      return getSelectedParticipantsNames();
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (formData.participants.length > 0 && e.target.value) {
      setFormData(prev => ({
        ...prev,
        participants: []
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{modalTitles[type]}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-wrapper'>
            <div className="form-section">
              {/* Поля для офиса */}
              {type === 'office' && (
                <>
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
                </>
              )}

              {/* Поля для сотрудника */}
              {type === 'colleague' && (
                <>
                  <div className="form-group">
                    <label className="form-label">ФИО:</label>
                    <input
                      type="text"
                      className="form-input form-text"
                      placeholder="Введите ФИО сотрудника"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Должность:</label>
                    <input
                      type="text"
                      className="form-input form-text"
                      placeholder="Введите должность"
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Отдел:</label>
                    <input
                      type="text"
                      className="form-input form-text"
                      placeholder="Введите отдел"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Офис:</label>
                    <select
                      className="form-select form-text"
                      value={formData.office}
                      onChange={(e) => handleChange('office', e.target.value)}
                      required
                    >
                      <option value="" disabled hidden>Выберите офис</option>
                      {/* {mockOffices.map(office => (
                        <option key={office.id} value={office.id} className='form-text'>
                          {office.name}
                        </option>
                      ))} */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email:</label>
                    <input
                      type="email"
                      className="form-input form-text"
                      placeholder="Введите email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Телефон:</label>
                    <input
                      type="tel"
                      className="form-input form-text"
                      placeholder="Введите телефон"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Дата рождения:</label>
                    <input
                      type="date"
                      className="form-input form-text"
                      value={formData.birthDate}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Остальные типы */}
              {(type !== 'colleague' && type !== 'office') && (
                <>
                  <div className="form-group">
                    <label className="form-label">Название:</label>
                    <input
                      type="text"
                      className="form-input form-text"
                      placeholder={`Введите название ${type === 'release' ? 'релиза' : type === 'project' ? 'проекта' : type === 'meeting' ? 'встречи' : 'задачи'}`}
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                    />
                  </div>

                  {type === 'meeting' && (
                    <div className="form-group">
                      <label className="form-label">Проект:</label>
                      <select
                        className="form-select form-text"
                        value={formData.project}
                        onChange={(e) => handleChange('project', e.target.value)}
                        required
                      >
                        <option value="" disabled hidden>Выберите проект</option>
                        {
                          projects.map(project => (
                            <option key={project.id} value={project.id} className='form-select-item'>
                              {project.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  {type === 'meeting' && (
                    <div className="form-group">
                      <label className="form-label">Участники:</label>
                      <div className="participants-selector">
                        <input
                          ref={inputRef}
                          type="text"
                          className="form-input form-text"
                          placeholder={formData.participants.length === 0 ? "Поиск сотрудников..." : ""}
                          value={getInputDisplayValue()}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                        />
                        {showDropdown && (
                          <div ref={dropdownRef} className="participants-dropdown">
                            {filteredColleagues.map(colleague => (
                              <div
                                key={colleague.id}
                                className={`participant-option ${formData.participants.includes(colleague.id) ? 'selected' : ''}`}
                                onClick={() => handleParticipantToggle(colleague.id)}
                              >
                                <div className="participant-info">
                                  <div className="participant-name">{colleague.lname} {colleague.fname} {colleague.mname}</div>
                                  <div className="participant-position">{colleague.position}</div>
                                </div>
                                <div className="participant-checkbox">
                                  {formData.participants.includes(colleague.id) ? '✓' : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {formData.participants.length > 0 && (
                          <div className="selected-participants">
                            <div className="selected-participants-label">Выбрано: {getSelectedParticipantsNames()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {type === 'meeting' && (
                    <div className="form-group">
                      <label className="form-label">Дата и время:</label>
                      <div className="datetime-inputs">
                        <input
                          type="date"
                          className="form-input form-text"
                          value={formData.meetingDate}
                          onChange={(e) => handleChange('meetingDate', e.target.value)}
                          required
                        />
                        <input
                          type="time"
                          className="form-input form-text"
                          value={formData.meetingTime}
                          onChange={(e) => handleChange('meetingTime', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

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
                        {type === 'task'
                          ? projects.map(project => (
                            <option key={project.id} value={project.id} className='form-select-item'>
                              {project.name}
                            </option>
                          ))
                          :
                          projects.map(project => (
                            <option key={project.id} value={project.id} className='form-text'>
                              {/* {project.name} */}
                            </option>
                          ))
                        }
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
                        {colleagues.map(colleague => (
                          <option key={colleague.id} value={colleague.id} className='form-select-item'>
                            {colleague.fname} {colleague.lname} - {colleague.position}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(type !== 'meeting') && (
                    <div className="form-group">
                      <label className="form-label">Срок:</label>
                      <input
                        type="date"
                        className="form-input form-text"
                        value={formData.end_date}
                        onChange={(e) => handleChange('end_date', e.target.value)}
                        required={type === 'task'}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Описание (для всех типов кроме colleague и office) */}
            {(type !== 'colleague' && type !== 'office') && (
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
            )}
          </div>

          <div className="modal-actions">
            <div className="action-buttons">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Отменить
              </button>
              <button type="submit" className="btn-primary">
                {mode === 'edit' ? 'Сохранить' :
                  type === 'colleague' ? 'Добавить сотрудника' : 'Добавить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;