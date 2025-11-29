import { useEffect, useState } from 'react';
import { Employee } from '@types';
import EmployeesListUI from '@ui/EmployeeList';

type EmployeeListProps = {
  items: Employee[];
  onItemClick?: (employee: Employee) => void;
}

interface EmployeesListWithActiveProps extends EmployeeListProps {
  activeEmployeeId?: string | null;
  onActiveEmployeeChange?: (id: string | null) => void;
}

const EmployeesList = ({
  items,
  onItemClick,
  activeEmployeeId,
  onActiveEmployeeChange
}: EmployeesListWithActiveProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const searchEmployees = (query: string, employees: Employee[]): Employee[] => {
    if (!query.trim()) return employees;

    const lowercaseQuery = query.toLowerCase().trim();

    return employees.filter(employee => {
      if (!employee) return false;

      const fnameMatch = employee.fname?.toLowerCase().includes(lowercaseQuery) || false;
      const mnameMatch = employee.mname?.toLowerCase().includes(lowercaseQuery) || false;
      const lnameMatch = employee.lname?.toLowerCase().includes(lowercaseQuery) || false;
      const positionMatch = employee.position?.toLowerCase().includes(lowercaseQuery) || false;

      let departmentMatch = false;
      if (employee.employee_departments && employee.employee_departments.length > 0) {
        const firstDepartment = employee.employee_departments[0];
        departmentMatch = firstDepartment?.office?.toLowerCase().includes(lowercaseQuery) || false;
      }

      const emailMatch = employee.email?.toLowerCase().includes(lowercaseQuery) || false;
      const phoneMatch = employee.phone?.toLowerCase().includes(lowercaseQuery) || false;

      return fnameMatch ||
        mnameMatch ||
        lnameMatch ||
        positionMatch ||
        departmentMatch ||
        emailMatch ||
        phoneMatch;
    });
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredEmployees(searchEmployees(searchQuery, items));
    } else {
      setFilteredEmployees(items);
    }
  }, [searchQuery, items]);

  const handleItemClick = (employee: Employee) => {
    onActiveEmployeeChange?.(employee.id);
    onItemClick?.(employee);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <EmployeesListUI
      items={filteredEmployees}
      searchQuery={searchQuery}
      activeEmployeeId={activeEmployeeId}
      onItemClick={handleItemClick}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
    />
  );
};

export default EmployeesList;