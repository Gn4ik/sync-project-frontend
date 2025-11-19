import { useEffect, useState } from 'react';
import { Colleague, ColleagueListProps } from '../types/types';
import './ColleaguesList.css';
import searchIcon from '../../icons/SearchIcon.svg';

const ColleaguesList = ({ items, onItemClick }: ColleagueListProps) => {
  const [activeColleagueId, setActiveColleagueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredColleagues, setFilteredColleagues] = useState<Colleague[]>([]);
  const handleItemClick = (colleague: Colleague) => {
    onItemClick?.(colleague);
    setActiveColleagueId(colleague.id);
  };

  const searchColleagues = (query: string, colleagues: Colleague[]): Colleague[] => {
    if (!query.trim()) return colleagues;

    return colleagues.filter(colleague =>
      colleague.name.toLowerCase().includes(query.toLowerCase()) ||
      colleague.position.toLowerCase().includes(query.toLowerCase()) ||
      (colleague.department && colleague.department.toLowerCase().includes(query.toLowerCase()))
    );
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
                <img src={colleague.avatar} alt={colleague.name} />
              ) : (
                <div className="avatar-placeholder">
                  {colleague.name.charAt(0).toUpperCase()}
                </div>
              )}
              {colleague.isOnline && <div className="online-indicator" />}
            </div>
            <div className="colleague-info">
              <div className="colleague-name">{colleague.name}</div>
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