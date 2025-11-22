import { useEffect, useRef, useState } from 'react';
import './SideBar.css';
import NavButtons from '../NavButtons/NavButtons';
import TasksList from '../TasksList/TasksList';
import { Colleague, ListNode, ReleaseItem, TaskItem } from '../types/types';
import ColleaguesList from '../ColleaguesList/ColleaguesList';
import InfoModal from '../InfoModal/InfoModal';

interface SideBarProps {
  onTaskSelect: (task: TaskItem) => void;
  onColleagueSelect: (colleague: Colleague) => void;
}

const SideBar = ({ onTaskSelect, onColleagueSelect }: SideBarProps) => {
  const [activeList, setActiveList] = useState<'tasks' | 'colleagues'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'my'>('all');
  const [currentUserId, setCurrentUserId] = useState(1);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'release' | 'project' | null; data: any }>({
    isOpen: false,
    type: null,
    data: null
  });

  // useEffect(() => {
  //   const savedUserId = localStorage.getItem('currentUserId');
  //   if (savedUserId) {
  //     setCurrentUserId(savedUserId);
  //   }
  // }, []);

  const mockTasks: ReleaseItem[] = [
    {
      id: '1',
      title: 'Релиз 1',
      isExpanded: false,
      children: [
        {
          id: '2',
          title: 'Проект 100',
          isExpanded: false,
          description: `ЙУЦЙУЛЙЦОО ФЫВЫВФЫВФ ЧЯССЯС zzzzzzzzzzzzzzzzzzzzzzzzzz qqqqqqqqqqqqqqqqq aaaaaaaaaaaaaaaaaaaaaaaaa zzzzzzzzzzzzzzzzzzzzzzzzzz sssssssssssssssssssssssss`,
          children: [
            {
              id: '3',
              title: 'Разработка формы авторизации для личного кабинета',
              isExpanded: false,
              executor: 1,
              status: 'stopped',
              createdDate: '2025-11-15',
              deadline: '2025-12-15',
              description: `Необходимо разработать адаптивную форму авторизации с валидацией полей. Форма должна включать:
Поле email с проверкой формата
Поле пароля с toggle видимости
Чекбокс "Запомнить меня"
Кнопку "Войти"
Ссылки "Забыли пароль?" и "Регистрация"`
            },
            {
              id: '3221',
              title: 'Разработка формы авторизации для личного кабинета',
              isExpanded: false,
              executor: 1,
              status: 'on-work',
              createdDate: '2025-11-13',
              deadline: '2025-11-15',
              description: `Необходимо разработать адаптивную форму авторизации с валидацией полей. Форма должна включать:
Поле email с проверкой формата
Поле пароля с toggle видимости
Чекбокс "Запомнить меня"
Кнопку "Войти"
Ссылки "Забыли пароль?" и "Регистрация"`
            },
            {
              id: '412421',
              title: 'Разработка формы авторизации для личного кабинета',
              isExpanded: false,
              executor: 2,
              status: 'closed',
              createdDate: '2025-11-11',
              deadline: '2025-12-01',
              description: `Необходимо разработать адаптивную форму авторизации с валидацией полей. Форма должна включать:
Поле email с проверкой формата
Поле пароля с toggle видимости
Чекбокс "Запомнить меня"
Кнопку "Войти"
Ссылки "Забыли пароль?" и "Регистрация"`
            },
            {
              id: '65655',
              title: 'Разработка формы авторизации для личного кабинета',
              isExpanded: false,
              executor: 3,
              status: 'completed',
              createdDate: '2025-12-15',
              deadline: '2025-12-31',
              description: `Необходимо разработать адаптивную форму авторизации с валидацией полей. Форма должна включать:
Поле email с проверкой формата
Поле пароля с toggle видимости
Чекбокс "Запомнить меня"
Кнопку "Войти"
Ссылки "Забыли пароль?" и "Регистрация"
Поле пароля с toggle видимости
Поле пароля с toggle видимости
Поле пароля с toggle видимости`
            },
          ]
        },
        {
          id: '4',
          title: 'Проект 2',
          isExpanded: false,
        }
      ]
    },
    {
      id: '5',
      title: 'Релиз 2',
      isExpanded: false,
      children: [
        {
          id: '6',
          title: 'Разработка формы авторизации для личного кабинета',
        },
        {
          id: '7',
          title: 'Разработка формы авторизации для личного кабинета',
        },
      ]
    },
    {
      id: '8',
      title: 'Релиз 121',
      isExpanded: false,
      children: [
        {
          id: '9',
          title: 'проект 1234',
        }
      ]
    }
  ];

  const mockColleagues: Colleague[] = [
    {
      id: '1',
      name: 'Артем Evil',
      position: 'Backend-разработчик',
      department: 'Разработка',
      isOnline: true
    },
    {
      id: '2',
      name: 'Gn4ik',
      position: 'Frontend-разработчик',
      department: 'Разработка',
      isOnline: true
    },
    {
      id: '3',
      name: 'Ksu Vedernikova',
      position: 'Технический писатель',
      department: 'Тестирование',
      isOnline: false
    },
    {
      id: '4',
      name: 'Полина Сидорина',
      position: 'Дизайнер',
      department: 'Дизайн',
      isOnline: true
    },
    {
      id: '5',
      name: 'Иван Садиков',
      position: 'Глава отдела',
      department: 'Управление',
      isOnline: true
    }
  ];

  const getFilteredTasks = (data: ReleaseItem[]): ReleaseItem[] => {
    if (taskFilter === 'all') {
      return data;
    }

    const filterTasks = (items: ReleaseItem[]): ReleaseItem[] => {
      return items
        .map(item => {
          if ('executor' in item && item.executor) {
            if (item.executor === currentUserId) {
              return item;
            }
            return null;
          }

          if (item.children) {
            const filteredChildren = filterTasks(item.children);
            if (filteredChildren.length > 0) {
              return {
                ...item,
                children: filteredChildren
              };
            }
            return null;
          }

          return null;
        })
        .filter(Boolean) as ReleaseItem[];
    };

    return filterTasks(data);
  };

  const filteredTasks = getFilteredTasks(mockTasks);
  console.log(filteredTasks);

  const handleTaskClick = (task: TaskItem) => {
    onTaskSelect(task);
  };

  const handleColleagueClick = (colleague: Colleague) => {
    onColleagueSelect(colleague);
  };

  const handleFilterChange = (filter: 'all' | 'my') => {
    setTaskFilter(filter);
  };

  const handleInfoClick = (item: ListNode) => {
    if (item.type === 'release' || item.type === 'project') {
      setInfoModal({
        isOpen: true,
        type: item.type,
        data: item
      });
    }
  };

  const handleInfoModalClose = () => {
    setInfoModal({
      isOpen: false,
      type: null,
      data: null
    });
  };

  return (
    <div className="sidebar-container">
      <NavButtons
        activeList={activeList}
        onListChange={setActiveList}
        onFilterChange={handleFilterChange}
        currentFilter={taskFilter}
      />

      {activeList === 'tasks' ? (
        <TasksList
          items={filteredTasks}
          onItemClick={handleTaskClick}
          onInfoClick={handleInfoClick}
        />
      ) : (
        <ColleaguesList
          items={mockColleagues}
          onItemClick={handleColleagueClick}
        />
      )}

      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={handleInfoModalClose}
        type={infoModal.type}
        data={infoModal.data}
      />
    </div>
  );
}

export default SideBar;