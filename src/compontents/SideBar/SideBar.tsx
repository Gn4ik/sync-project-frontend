import { useEffect, useRef, useState } from 'react';
import './SideBar.css';
import NavButtons from '../NavButtons/NavButtons';
import TasksList from '../TasksList/TasksList';
import { Colleague, ReleaseItem, TaskItem } from '../types/types';
import ColleaguesList from '../ColleaguesList/ColleaguesList';

interface SideBarProps {
  onTaskSelect: (task: TaskItem) => void;
}

const SideBar = ({ onTaskSelect }: SideBarProps) => {
  const [activeList, setActiveList] = useState<'tasks' | 'colleagues'>('tasks');

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
              executor: 1,
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
              executor: 1,
              status: 'completed',
              createdDate: '2025-12-15',
              deadline: '2025-12-31',
              description: `Необходимо разработать адаптивную форму авторизации с валидацией полей. Форма должна включать:
Поле email с проверкой формата
Поле пароля с toggle видимости
Чекбокс "Запомнить меня"
Кнопку "Войти"
Ссылки "Забыли пароль?" и "Регистрация"`
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
    },
    {
      id: '6',
      name: 'Пьер Дун',
      position: 'Мастер прокрастинации',
      department: 'Генеральный директор',
      isOnline: true
    },
    {
      id: '100',
      name: 'Препод',
      position: 'Заказчик',
      department: 'Лобач',
      isOnline: true
    }
  ];

  const handleTaskClick = (task: TaskItem) => {
    onTaskSelect(task);
  };

  return (
    <div className="sidebar-container">
      <NavButtons
        activeList={activeList}
        onListChange={setActiveList}
      />

      {activeList === 'tasks' ? (
        <TasksList
          items={mockTasks}
          onItemClick={handleTaskClick}
        />
      ) : (
        <ColleaguesList
          items={mockColleagues}
        />
      )}
    </div>
  );
}

export default SideBar;