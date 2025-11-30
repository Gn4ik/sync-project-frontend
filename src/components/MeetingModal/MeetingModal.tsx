import { useState, useEffect, useRef } from 'react';
import { Modal } from '@components/Modal/Modal';
import { Employee, ProjectItem } from '@components/types';
import { SuccessModal } from '@components/SuccessModal/SuccessModal';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => Promise<boolean>;
  mode?: 'create' | 'edit';
  initialData?: any;
  employees: Employee[];
}

export const MeetingModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
  employees
}: MeetingModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    employees: [] as string[],
    meetingDate: '',
    meetingTime: '',
    description: '',
    link: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        employees: initialData.employees || [],
        meetingDate: initialData.meetingDate || '',
        meetingTime: initialData.meetingTime || '',
        description: initialData.description || '',
        link: initialData.link || ''
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        employees: [],
        meetingDate: '',
        meetingTime: '',
        description: '',
        link: ''
      });
      setIsSuccess(false);
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
      employees: prev.employees.includes(employeeId)
        ? prev.employees.filter(id => id !== employeeId)
        : [...prev.employees, employeeId]
    }));
  };

  const getSelectedParticipantsNames = () => {
    return formData.employees.map(id =>
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
    if (formData.employees.length > 0) return getSelectedParticipantsNames();
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (formData.employees.length > 0 && e.target.value) {
      setFormData(prev => ({ ...prev, participants: [] }));
    }
  };

  const handleSubmit = async () => {
    const submitData = {
      name: formData.name,
      description: formData.description,
      date: `${formData.meetingDate} ${formData.meetingTime}:00`,
      link: formData.link,
      employees: formData.employees.map(id => parseInt(id)),
    };
    const success = await onSubmit(submitData, 'meeting');

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
    if (mode === 'edit') return 'Встреча успешно обновлена!';
    return 'Встреча успешно создана!';
  };

  const title = mode === 'edit' ? 'Редактировать встречу' : 'Создать встречу';

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
            placeholder="Введите название встречи"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Участники:</label>
          <div className="participants-selector">
            <input
              ref={inputRef}
              type="text"
              className="form-input form-text"
              placeholder={formData.employees.length === 0 ? "Поиск сотрудников..." : ""}
              value={getInputDisplayValue()}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && (
              <div ref={dropdownRef} className="participants-dropdown">
                {filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className={`participant-option ${formData.employees.includes(employee.id) ? 'selected' : ''}`}
                    onClick={() => handleParticipantToggle(employee.id)}
                  >
                    <div className="participant-info">
                      <div className="participant-name">{employee.lname} {employee.fname} {employee.mname}</div>
                      <div className="participant-position">{employee.position}</div>
                    </div>
                    <div className="participant-checkbox">
                      {formData.employees.includes(employee.id) ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {formData.employees.length > 0 && (
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

        <div className="form-group">
          <label className="form-label">Ссылка:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите ссылку на встречу"
            value={formData.link}
            onChange={(e) => handleChange('link', e.target.value)}
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