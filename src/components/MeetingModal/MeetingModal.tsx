import { useState, useEffect, useRef } from 'react';
import { Modal } from '@components/Modal/Modal';
import { Employee, ProjectItem } from '@components/types';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
  employees: Employee[];
  projects: ProjectItem[];
}

export const MeetingModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
  employees,
  projects
}: MeetingModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    participants: [] as string[],
    meetingDate: '',
    meetingTime: '',
    description: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        title: initialData.name || '',
        project: initialData.project_id?.toString() || '',
        participants: initialData.participants || [],
        meetingDate: initialData.meetingDate || '',
        meetingTime: initialData.meetingTime || '',
        description: initialData.description || '',
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        project: '',
        participants: [],
        meetingDate: '',
        meetingTime: '',
        description: '',
      });
    }
    setSearchTerm('');
    setShowDropdown(false);
  }, [isOpen, initialData, mode]);

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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleParticipantToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(employeeId)
        ? prev.participants.filter(id => id !== employeeId)
        : [...prev.participants, employeeId]
    }));
  };

  const getSelectedParticipantsNames = () => {
    return formData.participants.map(id =>
      employees.find(c => c.id === id)?.fname + ' ' + employees.find(c => c.id === id)?.lname
    ).filter(Boolean).join(', ');
  };

  const filteredEmployees = employees.filter(employee =>
    employee.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.mname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInputDisplayValue = () => {
    if (searchTerm) return searchTerm;
    if (formData.participants.length > 0) return getSelectedParticipantsNames();
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (formData.participants.length > 0 && e.target.value) {
      setFormData(prev => ({ ...prev, participants: [] }));
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      type: 'meeting'
    });
  };

  const title = mode === 'edit' ? 'Редактировать встречу' : 'Создать встречу';

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
            placeholder="Введите название встречи"
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
          <label className="form-label">Участники:</label>
          <div className="participants-selector">
            <input
              ref={inputRef}
              type="text"
              className="form-input form-text"
              placeholder={formData.participants.length === 0 ? "Поиск сотрудников..." : ""}
              value={getInputDisplayValue()}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && (
              <div ref={dropdownRef} className="participants-dropdown">
                {filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className={`participant-option ${formData.participants.includes(employee.id) ? 'selected' : ''}`}
                    onClick={() => handleParticipantToggle(employee.id)}
                  >
                    <div className="participant-info">
                      <div className="participant-name">{employee.lname} {employee.fname} {employee.mname}</div>
                      <div className="participant-position">{employee.position}</div>
                    </div>
                    <div className="participant-checkbox">
                      {formData.participants.includes(employee.id) ? '✓' : ''}
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