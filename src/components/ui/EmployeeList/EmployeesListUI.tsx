import React from 'react';
import { Employee } from '@types';
import './EmployeesList.css';
import searchIcon from '@icons/SearchIcon.svg';

interface EmployeesListUIProps {
  items: Employee[];
  searchQuery: string;
  activeEmployeeId?: string | null;
  onItemClick: (employee: Employee) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

const EmployeesListUI: React.FC<EmployeesListUIProps> = ({
  items,
  searchQuery,
  activeEmployeeId,
  onItemClick,
  onSearchChange,
  onClearSearch
}) => {
  return (
    <>
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder='Поиск сотрудников'
            value={searchQuery}
            onChange={onSearchChange}
            className="search-input"
          />
          {searchQuery ? (
            <button className="search-clear" onClick={onClearSearch}>
              ×
            </button>
          ) : (
            <img src={searchIcon} alt="Search" className="search-icon" />
          )}
        </div>
      </div>
      <div className="employees-list">
        {items.map(employee => (
          <div
            key={employee.id}
            className={`employee-item ${activeEmployeeId === employee.id ? 'active' : ''}`}
            onClick={() => onItemClick(employee)}
          >
            <div className="employee-avatar">
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.fname} />
              ) : (
                <div className="avatar-placeholder">
                  {employee.fname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="employee-info">
              <div className="employee-name">
                {employee.lname} {employee.fname} {employee.mname}
              </div>
              <div className="employee-position">{employee.position}</div>
            </div>
          </div>
        ))}
      </div>
      {searchQuery && items.length === 0 && (
        <div className="no-results">
          Сотрудники не найдены
        </div>
      )}
    </>
  );
};

export default EmployeesListUI;