import { useState, useEffect } from 'react';
import { Modal } from '@components/Modal/Modal';
import { Employee } from '@components/types';
import { SuccessModal } from '@components/SuccessModal/SuccessModal';

interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => Promise<boolean>;
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

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        lead_id: initialData.lead_id || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        lead_id: '',
      });
    }
    setIsSuccess(false);
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    let success;
    if (mode === 'edit') {
      success = await onSubmit({ ...formData, id: initialData.id }, 'department');
    } else {
      success = await onSubmit(formData, 'department');
    }

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 5000);
    }
  };

  const getSelectedLeadName = () => {
    if (!formData.lead_id) return '';
    const selectedEmployee = employees.find(emp => emp.id.toString() === formData.lead_id);
    return selectedEmployee
      ? `${selectedEmployee.lname} ${selectedEmployee.fname} ${selectedEmployee.mname}`
      : '';
  };

  const title = mode === 'edit' ? 'Редактировать отдел' : 'Добавить отдел';
  const submitText = mode === 'edit' ? 'Сохранить' : 'Добавить отдел';

  const handleSuccessClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const getSuccessMessage = () => {
    if (mode === 'edit') return 'Отдел успешно обновлен!';
    return 'Отдел успешно создан!';
  };

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
            <option value="" disabled hidden className='form-text'>
              {formData.lead_id ? getSelectedLeadName() : 'Выберите руководителя'}
            </option>
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