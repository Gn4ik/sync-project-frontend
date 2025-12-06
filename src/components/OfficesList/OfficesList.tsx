import React, { useState, useEffect } from 'react';
import { Department, Employee } from '@types';
import EmployeesList from '../EmployeesList/EmployeesList';
import './OfficesList.css';
import searchIcon from '@icons/SearchIcon.svg';
import { OfficeModal } from '@components/OfficeModal/OfficeModal';

interface OfficesListProps {
  items: Department[];
  employees: Employee[];
  onEmployeeSelect?: (employee: Employee) => void;
  onDepartmentUpdate: (formadata: any, type: string) => Promise<boolean>;
}

const OfficesList: React.FC<OfficesListProps> = ({ items, employees, onEmployeeSelect, onDepartmentUpdate }) => {
  const [expandedOffices, setExpandedOffices] = useState<Set<string>>(new Set());
  const [hoveredOffice, setHoveredOffice] = useState<string | null>(null);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(items);
  const toggleOffice = (officeId: string) => {
    setExpandedOffices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(officeId)) {
        newSet.delete(officeId);
      } else {
        newSet.add(officeId);
      }
      return newSet;
    });
  };

  const [departmentModal, setDepartmentModal] = useState<{
    isOpen: boolean;
    department: Department | null;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    department: null,
    mode: 'edit'
  });

  const handleInfoClick = (e: React.MouseEvent, department: Department) => {
    e.stopPropagation();
    setDepartmentModal({
      isOpen: true,
      department,
      mode: 'edit'
    });
  };

  const handleModalClose = () => {
    setDepartmentModal({
      isOpen: false,
      department: null,
      mode: 'edit'
    });
  };

  const handleEmployeeClick = (employee: Employee) => {
    setActiveEmployeeId(employee.id);
    onEmployeeSelect?.(employee);
  };

  const handleInfoMouseEnter = (officeId: string) => {
    setHoveredOffice(officeId);
  };

  const handleInfoMouseLeave = () => {
    setHoveredOffice(null);
  };

  const searchDepartments = (query: string, departments: Department[]): Department[] => {
    if (!query.trim()) return departments;

    const lowercaseQuery = query.toLowerCase();

    return departments.filter(department => {
      const officeNameMatch = department?.name?.toLowerCase().includes(lowercaseQuery) || false;
      const managerMatch = department.lead?.fname?.toLowerCase().includes(lowercaseQuery)
        || department.lead?.lname?.toLowerCase().includes(lowercaseQuery)
        || department.lead?.mname?.toLowerCase().includes(lowercaseQuery) || false;

      const employeesMatch = department.staff?.some(staff => {
        if (!staff) return false;

        const fnameMatch = staff.employee.fname?.toLowerCase().includes(lowercaseQuery) || false;
        const mnameMatch = staff.employee.mname?.toLowerCase().includes(lowercaseQuery) || false;
        const lnameMatch = staff.employee.lname?.toLowerCase().includes(lowercaseQuery) || false;
        const positionMatch = staff.employee.position?.toLowerCase().includes(lowercaseQuery) || false;

        const departmentMatch = staff.employee.employee_departments?.[0]?.office?.toLowerCase().includes(lowercaseQuery) || false;

        return fnameMatch || mnameMatch || lnameMatch || positionMatch || departmentMatch;
      }) || false;

      return officeNameMatch || managerMatch || employeesMatch;
    });
  };

  const getDepartmentEmployees = (department: Department): Employee[] => {
    if (!department.staff || !Array.isArray(department.staff)) {
      return [];
    }

    const employees = department.staff
      .filter(staffItem => staffItem && staffItem.employee)
      .map(staffItem => staffItem.employee);

    const leadEmployee = employees.find(employee => employee.id === department.lead_id.toString());
    if (leadEmployee && !employees.some(emp => emp.id === leadEmployee.id)) {
      employees.unshift(leadEmployee);
    }

    return employees;
  };

  const getLeadName = (department: Department): string | undefined => {
    const leadEmployee = employees.find(employee => {
      const employeeId = employee.id.toString();
      const leadId = department.lead_id?.toString();
      return employeeId === leadId;
    });

    if (leadEmployee) {
      const name = `${leadEmployee.lname || ''} ${leadEmployee.fname || ''} ${leadEmployee.mname || ''}`.trim();
      return name;
    }
  }

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredDepartments(searchDepartments(searchQuery, items));
    } else {
      setFilteredDepartments(items);
    }
  }, [searchQuery, items, employees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="offices-list-container">
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder='Поиск офисов и сотрудников'
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery ? (
            <button className="search-clear" onClick={clearSearch}>
              ×
            </button>
          ) : (
            <img src={searchIcon} alt="Search" className="search-icon" />
          )}
        </div>
      </div>

      <div className="offices-list">
        {filteredDepartments.map(department => {
          const isExpanded = expandedOffices.has(department.id.toString());

          return (
            <div key={department.id} className={`office-block ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="office-header"
                onClick={() => toggleOffice(department.id.toString())}
              >
                <div className="office-header-content">
                  <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    ❯
                  </span>

                  <span className="office-title">{department.name}</span>

                  <div className="office-header-right">
                    <div className="office-info-wrapper">
                      {isExpanded && (
                        <>
                          <button
                            className="info-button"
                            onMouseEnter={() => handleInfoMouseEnter(department.id.toString())}
                            onMouseLeave={handleInfoMouseLeave}
                            onClick={(e) => handleInfoClick(e, department)}
                          >
                            ℹ
                          </button>

                          {hoveredOffice === department.id.toString() && (
                            <div className="manager-tooltip">
                              Руководитель: {getLeadName(department)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="office-employees">
                  <EmployeesList
                    items={getDepartmentEmployees(department)}
                    onItemClick={handleEmployeeClick}
                    activeEmployeeId={activeEmployeeId}
                    onActiveEmployeeChange={setActiveEmployeeId}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {searchQuery && filteredDepartments.length === 0 && (
        <div className="no-results">
          Ничего не найдено
        </div>
      )}

      <OfficeModal
        isOpen={departmentModal.isOpen}
        onClose={handleModalClose}
        initialData={departmentModal.department}
        onSubmit={onDepartmentUpdate}
        mode='edit'
        employees={employees}
      />
    </div>
  );
};

export default OfficesList;