import { useEffect, useState } from 'react';
import { Colleague } from '@types';
import ColleaguesListUI from '@ui/ColleagueList';

type ColleagueListProps = {
  items: Colleague[];
  onItemClick?: (colleague: Colleague) => void;
}

interface ColleaguesListWithActiveProps extends ColleagueListProps {
  activeColleagueId?: string | null;
  onActiveColleagueChange?: (id: string | null) => void;
}

const ColleaguesList = ({
  items,
  onItemClick,
  activeColleagueId,
  onActiveColleagueChange
}: ColleaguesListWithActiveProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredColleagues, setFilteredColleagues] = useState<Colleague[]>([]);

  const searchColleagues = (query: string, colleagues: Colleague[]): Colleague[] => {
    if (!query.trim()) return colleagues;

    const lowercaseQuery = query.toLowerCase().trim();

    return colleagues.filter(colleague => {
      if (!colleague) return false;

      const fnameMatch = colleague.fname?.toLowerCase().includes(lowercaseQuery) || false;
      const mnameMatch = colleague.mname?.toLowerCase().includes(lowercaseQuery) || false;
      const lnameMatch = colleague.lname?.toLowerCase().includes(lowercaseQuery) || false;
      const positionMatch = colleague.position?.toLowerCase().includes(lowercaseQuery) || false;

      let departmentMatch = false;
      if (colleague.employee_departments && colleague.employee_departments.length > 0) {
        const firstDepartment = colleague.employee_departments[0];
        departmentMatch = firstDepartment?.office?.toLowerCase().includes(lowercaseQuery) || false;
      }

      const emailMatch = colleague.email?.toLowerCase().includes(lowercaseQuery) || false;
      const phoneMatch = colleague.phone?.toLowerCase().includes(lowercaseQuery) || false;

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
      setFilteredColleagues(searchColleagues(searchQuery, items));
    } else {
      setFilteredColleagues(items);
    }
  }, [searchQuery, items]);

  const handleItemClick = (colleague: Colleague) => {
    onActiveColleagueChange?.(colleague.id);
    onItemClick?.(colleague);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <ColleaguesListUI
      items={filteredColleagues}
      searchQuery={searchQuery}
      activeColleagueId={activeColleagueId}
      onItemClick={handleItemClick}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
    />
  );
};

export default ColleaguesList;