import { useEffect, useState } from 'react';
import { Colleague } from '../types/types';
import './ColleaguesList.css';
import searchIcon from '../../icons/SearchIcon.svg';

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

  const handleItemClick = (colleague: Colleague) => {
    onActiveColleagueChange?.(colleague.id);
    onItemClick?.(colleague);
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder='Поиск сотрудников'
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
      <div className="colleagues-list">
        {filteredColleagues.map(colleague => (
          <div
            key={colleague.id}
            className={`colleague-item ${activeColleagueId === colleague.id ? 'active' : ''}`}
            onClick={() => handleItemClick(colleague)}
          >
            <div className="colleague-avatar">
              {colleague.avatar ? (
                <img src={colleague.avatar} alt={colleague.fname} />
              ) : (
                <div className="avatar-placeholder">
                  {colleague.fname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="colleague-info">
              <div className="colleague-name">{colleague.lname} {colleague.fname} {colleague.mname}</div>
              <div className="colleague-position">{colleague.position}</div>
            </div>
          </div>
        ))}
      </div>
      {searchQuery && filteredColleagues.length === 0 && (
        <div className="no-results">
          Сотрудники не найдены
        </div>
      )}
    </>
  );
};

export default ColleaguesList;