import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';
import { Employee } from '@components/types';

interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
  employees: Employee[];
}

export const OfficeModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
  employees
}: OfficeModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    lead_id: '',
  });

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        lead_id: initialData.manager || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        lead_id: '',
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData, 'department');
  };

  const title = mode === 'edit' ? 'Редактировать отдел' : 'Добавить отдел';
  const submitText = mode === 'edit' ? 'Сохранить' : 'Добавить отдел';

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
          <label className="form-label">Название отдела:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите название отдела"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Руководитель:</label>
          <select
            className="form-select form-text"
            value={formData.lead_id}
            onChange={(e) => handleChange('lead_id', e.target.value)}
            required
          >
            <option value="" disabled hidden className='form-text'>Выберите руководителя</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id} className='form-select-item'>
                {employee.lname} {employee.fname} {employee.mname}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};