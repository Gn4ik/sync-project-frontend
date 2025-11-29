import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';
import { Employee } from '@components/types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData
}: EmployeeModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    office: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        name: initialData.lname + initialData.fname + initialData.mname || '',
        position: initialData.position || '',
        department: initialData.department || '',
        office: initialData.office || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        birthDate: initialData.birthDate || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        position: '',
        department: '',
        office: '',
        email: '',
        phone: '',
        birthDate: '',
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const title = mode === 'edit' ? 'Редактировать сотрудника' : 'Добавить сотрудника';
  const submitText = mode === 'edit' ? 'Сохранить' : 'Добавить сотрудника';

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
      </div>
    </Modal>
  );
};