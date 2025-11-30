import React, { useState } from 'react';
import '../Modal/Modal.css';
import './UserModal.css';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => void;
}

const UserModal = ({ isOpen, onClose, onSubmit }: UserModalProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    position: '',
    workSchedule: '',
    birthDate: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, 'employee');
    setFormData({
      fullName: '',
      role: '',
      position: '',
      workSchedule: '',
      birthDate: '',
      phone: '',
      email: ''
    });
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      role: '',
      position: '',
      workSchedule: '',
      birthDate: '',
      phone: '',
      email: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Добавить пользователя</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-wrapper'>
            <div className="form-group-fullwidth">
              <input
                type="text"
                className="form-input form-text"
                placeholder="Введите ФИО исполнителя"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Роль:</label>
                <select
                  className="form-select form-text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled hidden>Выберите роль</option>
                  <option value="user" className='form-text'>Пользователь</option>
                  <option value="manager" className='form-text'>Менеджер</option>
                  <option value="admin" className='form-text'>Администратор</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Должность:</label>
                <input
                  type="text"
                  className="form-input form-text"
                  placeholder="Введите должность"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Рабочий график:</label>
                <select
                  className="form-select form-text"
                  name="workSchedule"
                  value={formData.workSchedule}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled hidden>Выберите график</option>
                  <option value="full-time" className='form-text'>Полный день</option>
                  <option value="part-time" className='form-text'>Неполный день</option>
                  <option value="shift" className='form-text'>Сменный график</option>
                  <option value="flexible" className='form-text'>Гибкий график</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Дата рождения:</label>
                <input
                  type="date"
                  className="form-input form-text"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Контактный телефон:</label>
                <input
                  type="tel"
                  className="form-input form-text"
                  placeholder="Введите номер телефона"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Электронная почта:</label>
                <input
                  type="email"
                  className="form-input form-text"
                  placeholder="Введите электронную почту"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <div className="action-buttons">
              <button type="button" className="btn-secondary" onClick={handleClose}>
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

export default UserModal;