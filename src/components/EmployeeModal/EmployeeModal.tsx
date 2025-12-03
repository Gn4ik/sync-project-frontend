import React, { useEffect, useState } from 'react';
import { Modal } from '@components/Modal/Modal';
import { Employee, Department, Schedule, EmployeeDepartment } from '@components/types';
import { SuccessModal } from '@components/SuccessModal/SuccessModal';
import './EmployeeModal.css';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => Promise<boolean>;
  mode?: 'create' | 'edit';
  initialData?: Employee;
  schedules?: Schedule[];
  departments?: Department[];
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
  schedules = [],
  departments = []
}: EmployeeModalProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'user',
    position: '',
    scheduleId: 0,
    birthDate: '',
    phone: '',
    email: '',
    password: '',
    selectedDepartments: [] as number[],
    departmentOffices: {} as Record<number, string>
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {

      const offices: Record<number, string> = {};
      const selectedDepts: number[] = [];

      if (departments && initialData.id) {
        departments.forEach(department => {
          const isEmployeeInDepartment = department.staff?.some(
            staff => staff.employee_id.toString() === initialData.id.toString()
          );
          const isEmployeeLead = department.lead_id?.toString() === initialData.id.toString();

          if (isEmployeeInDepartment || isEmployeeLead) {
            selectedDepts.push(department.id);
            let office = '';
            if (isEmployeeInDepartment) {
              const staffItem = department.staff.find(
                staff => staff.employee_id.toString() === initialData.id.toString()
              );
              office = staffItem?.office || '';
            }
            offices[department.id] = office;
          }
        });
      }

      setFormData({
        fullName: `${initialData.lname} ${initialData.fname} ${initialData.mname || ''}`.trim(),
        role: getRoleName(initialData.role_id || 3),
        position: initialData.position || '',
        scheduleId: initialData.schedule?.id || 0,
        birthDate: initialData.dob ? initialData.dob.split('T')[0] : '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        password: '',
        selectedDepartments: selectedDepts,
        departmentOffices: offices
      });
    } else if (isOpen) {
      setFormData({
        fullName: '',
        role: 'user',
        position: '',
        scheduleId: 0,
        birthDate: '',
        phone: '',
        email: '',
        password: '',
        selectedDepartments: [],
        departmentOffices: {}
      });
      setIsSuccess(false);
    }
  }, [isOpen, initialData, mode, departments]);

  const getRoleName = (roleId: number): string => {
    switch (roleId) {
      case 1: return 'admin';
      case 2: return 'manager';
      case 3: return 'user';
      default: return 'user';
    }
  };

  const getRoleId = (role: string): number => {
    switch (role) {
      case 'admin': return 1;
      case 'manager': return 2;
      case 'user': return 3;
      default: return 3;
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDepartmentToggle = (departmentId: number) => {
    setFormData(prev => {
      const isSelected = prev.selectedDepartments.includes(departmentId);

      if (isSelected) {
        const newOffices = { ...prev.departmentOffices };
        delete newOffices[departmentId];

        return {
          ...prev,
          selectedDepartments: prev.selectedDepartments.filter(id => id !== departmentId),
          departmentOffices: newOffices
        };
      } else {
        return {
          ...prev,
          selectedDepartments: [...prev.selectedDepartments, departmentId],
          departmentOffices: {
            ...prev.departmentOffices,
            [departmentId]: ''
          }
        };
      }
    });
  };

  const handleOfficeChange = (departmentId: number, office: string) => {
    setFormData(prev => ({
      ...prev,
      departmentOffices: {
        ...prev.departmentOffices,
        [departmentId]: office
      }
    }));
  };

  const handleSelectAllDepartments = () => {
    const allDepartmentIds = departments.map(dept => dept.id);

    if (formData.selectedDepartments.length === allDepartmentIds.length) {
      setFormData(prev => ({
        ...prev,
        selectedDepartments: [],
        departmentOffices: {}
      }));
    } else {
      const allOffices: Record<number, string> = {};
      departments.forEach(dept => {
        allOffices[dept.id] = formData.departmentOffices[dept.id] || '';
      });

      setFormData(prev => ({
        ...prev,
        selectedDepartments: allDepartmentIds,
        departmentOffices: allOffices
      }));
    }
  };

  const parseSchedule = (id: number): string => {
    let scheduleString = '';
    switch (id) {
      case 0: {
        scheduleString = 'Вс-Чт';
        break;
      }
      case 1: {
        scheduleString = 'Вс-Ср';
        break;
      }
      case 2: {
        scheduleString = 'Только Сб';
        break;
      }
    }
    return scheduleString;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let success = false;

    const nameParts = formData.fullName.trim().split(/\s+/);

    if (nameParts.length < 2) {
      alert('Введите фамилию и имя через пробел');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'create' && !formData.password) {
      alert('Пожалуйста, введите пароль');
      setIsSubmitting(false);
      return;
    }

    if (formData.selectedDepartments.length === 0) {
      alert('Выберите хотя бы один отдел');
      setIsSubmitting(false);
      return;
    }

    const departmentsWithOffices = formData.selectedDepartments.map(id => {
      const office = formData.departmentOffices[id] || '';
      if (!office.trim()) {
        alert(`Заполните офис для отдела #${id}`);
        throw new Error(`Office missing for department ${id}`);
      }
      return {
        id: id,
        office: office
      };
    });

    const apiFormData: any = {
      lname: nameParts[0],
      fname: nameParts[1],
      mname: nameParts.slice(2).join(' ') || '',
      dob: formData.birthDate,
      schedule_id: formData.scheduleId,
      position: formData.position,
      role_id: getRoleId(formData.role),
      departments: departmentsWithOffices,
      phone: formData.phone,
      email: formData.email
    };

    if (mode === 'edit' && initialData) {
      apiFormData.id = initialData.id;
      success = await onSubmit(apiFormData, 'employee');
    } else if (mode === 'create') {
      apiFormData.password = formData.password;
      success = await onSubmit(apiFormData, 'employee');
    }

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 5000);
    }
    setIsSubmitting(false);
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const getSuccessMessage = () => {
    if (mode === 'edit') return 'Сотрудник успешно обновлен!';
    return 'Сотрудник успешно создан!';
  };

  const title = mode === 'edit' ? 'Редактировать сотрудника' : 'Добавить сотрудника';

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
          <label className="form-label">ФИО:</label>
          <input
            type="text"
            className="form-input form-text"
            placeholder="Введите ФИО сотрудника"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Роль:</label>
          <select
            className="form-select form-text"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="user" className='form-text'>Исполнитель</option>
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
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Расписание:</label>
          <select
            className="form-select form-text"
            value={formData.scheduleId}
            onChange={(e) => handleChange('scheduleId', parseInt(e.target.value))}
            required
            disabled={isSubmitting}
          >
            <option value="" disabled hidden>Выберите расписание</option>
            {schedules.map(schedule => (
              <option key={schedule.id} value={schedule.id} className='form-text'>
                {parseSchedule(schedule.id)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Дата рождения:</label>
          <input
            type="date"
            className="form-input form-text"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Контактный телефон:</label>
          <input
            type="tel"
            className="form-input form-text"
            placeholder="+79051534857"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Электронная почта:</label>
          <input
            type="email"
            className="form-input form-text"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        {mode === 'create' && (
          <div className="form-group">
            <label className="form-label">Пароль:</label>
            <input
              type="password"
              className="form-input form-text"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        )}
      </div>

      <div className="form-group-fullwidth">
        <div className="departments-header">
          <label className="form-label">Отделы:</label>
          <button
            type="button"
            className="btn-select-all"
            onClick={handleSelectAllDepartments}
            disabled={isSubmitting}
          >
            {formData.selectedDepartments.length === departments.length
              ? 'Снять все'
              : 'Выбрать все'}
          </button>
        </div>

        <div className="departments-list">
          {departments.map(department => {
            const isSelected = formData.selectedDepartments.includes(department.id);
            const office = formData.departmentOffices[department.id] || '';

            return (
              <div key={department.id} className="department-item">
                <div className="department-checkbox">
                  <input
                    type="checkbox"
                    id={`dept-${department.id}`}
                    checked={isSelected}
                    onChange={() => handleDepartmentToggle(department.id)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor={`dept-${department.id}`} className="department-label">
                    {department.name}
                  </label>
                </div>

                {isSelected && (
                  <div className="department-office-input">
                    <input
                      type="text"
                      className="form-input form-text office-input"
                      placeholder="Введите офис (например: Каб. 417)"
                      value={office}
                      onChange={(e) => handleOfficeChange(department.id, e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {formData.selectedDepartments.length === 0 && (
          <div className="form-hint">
            Выберите хотя бы один отдел
          </div>
        )}
      </div>
    </Modal>
  );
};