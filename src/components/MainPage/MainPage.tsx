import AppHeader from "../AppHeader/AppHeader";
import '@styles/styles.css'
import TaskInfo from "../TaskInfo/TaskInfo";
import SideBar from "../SideBar/SideBar";
import { useEffect, useState } from "react";
import { CalendarItem, Department, Employee, Meeting, ProjectItem, ReleaseItem, Status, TaskItem } from "@types";
import EmployeeInfo from "../EmployeeInfo/EmployeeInfo";
import Calendar from "../Calendar/Calendar";
import CalendarEvents from "../CalendarEvents/CalendarEvents";
import { authAPI, departmentsAPI, employeesAPI, meetingsAPI, projectsAPI, releasesAPI, statusAPI, tasksAPI } from "@utils/api";

const MainPage = () => {
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [showCalendarEvents, setShowCalendarEvents] = useState(false);
	const [statusesData, setStatusesData] = useState<Status[]>([]);

	const [currentUserRole, setCurrentUserRole] = useState<'executor' | 'manager' | 'admin' | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number>(0);
	const [taskInfoLoading, setTaskInfoLoading] = useState(false);

	const [releasesData, setReleasesData] = useState<ReleaseItem[]>([]);
	const [projects, setProjectsData] = useState<ProjectItem[]>([]);
	const [calendarData, setCalendarData] = useState<CalendarItem[]>([]);
	const [meetengsData, setMeetingsData] =  useState<Meeting[]>([]);
	const [employees, setEmployeesData] = useState<Employee[]>([]);
	const [departmentsData, setDepartmentsData] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);

	const updateTaskInList = (taskId: number, updates: Partial<TaskItem>) => {
		setReleasesData(prevReleases => {
			return prevReleases.map(release => ({
				...release,
				projects: release.projects?.map(project => ({
					...project,
					tasks: project.tasks?.map(task =>
						task.id === taskId ? { ...task, ...updates } : task
					)
				}))
			}));
		});
	};

	const checkRole = async () => {
		try {
			const token = localStorage.getItem('auth_token');
			if (!token)
				return;

			const response = await authAPI.getMe();

			const data = await response.json();

			const role = data.role?.description;
			const id = data.id;
			if (role === 'executor' || role === 'manager' || role === 'admin') {
				setCurrentUserRole(role);
				setCurrentUserId(id);
			} else {
				console.warn('Unknown role:', role);
				setCurrentUserRole(null);
			}
		} catch (error) {
			console.error('Token check failed:', error);
		} finally {
		}
	};

	function getDateInTwoWeeks() {
		const today = new Date();
		const inTwoWeeks = new Date(today);
		inTwoWeeks.setDate(today.getDate() + 14);
		return inTwoWeeks.toISOString().split('T')[0];
	}

	const today = new Date().toISOString().split('T')[0];
	const twoWeeksLater = getDateInTwoWeeks();

	useEffect(() => {
		checkRole();
		const loadAllData = async () => {
			try {
				setLoading(true);
				const [releases, employees, projects, departments, statuses, calendar, meetengs] = await Promise.all([
					releasesAPI.getReleases(),
					employeesAPI.getEmployees(),
					projectsAPI.getProjects(),
					departmentsAPI.getDepartments(),
					statusAPI.getStatuses(),
					employeesAPI.getEmployeeCalendar(today, twoWeeksLater),
					meetingsAPI.getMeetings()
				]);

				setReleasesData(releases);
				setEmployeesData(employees);
				setProjectsData(projects);
				setDepartmentsData(departments);
				setStatusesData(statuses);
				setCalendarData(calendar);
				setMeetingsData(meetengs);
			} catch (error) {
				console.error('Error loading data:', error);
			} finally {
				setLoading(false);
			}
		};
		loadAllData();
	}, []);

	const handleTaskSelect = (task: TaskItem) => {
		setSelectedTask(task);
		setSelectedEmployee(null);
		setShowCalendarEvents(false);
	};

	const handleEmployeeSelect = (employee: Employee) => {
		setSelectedEmployee(employee);
		setSelectedTask(null);
		setShowCalendarEvents(false);
	};

	const handleCalendarClick = () => {
		setShowCalendarEvents(prev => !prev);
		setSelectedTask(null);
		setSelectedEmployee(null);
	};

	const handleStatusChange = async (taskId: number, newStatusId: number) => {
		try {
			const token = localStorage.getItem('auth_token');
			if (!token) {
				return;
			}

			const response = await tasksAPI.updateTask({ id: taskId, status_id: newStatusId });

			if (response.ok) {
				const newStatus = statusesData.find(status => status.id === newStatusId);

				if (newStatus) {
					updateTaskInList(taskId, {
						status_id: newStatusId,
						status: newStatus
					});

					if (selectedTask && selectedTask.id === taskId) {
						setSelectedTask(prev => prev ? {
							...prev,
							status_id: newStatusId,
							status: newStatus
						} : null);
					}
				}
			} else {
				console.error('Ошибка при обновлении статуса');
			}
		} catch (error) {
			console.error('Ошибка сети:', error);
		}

	};

	const refreshTasks = async () => {
		try {
			const newReleases = await releasesAPI.getReleases();
			setReleasesData(newReleases);
		} catch (error) {
			console.error('Error refreshing tasks:', error);
		}
	};

	const refreshProjects = async () => {
		refreshTasks();
		try {
			const newProjects = await projectsAPI.getProjects();
			setProjectsData(newProjects);
		} catch (error) {
			console.error('Error refreshing tasks:', error);
		}
	}

	const refreshSelectedTask = async (taskId: number) => {
		try {
			setTaskInfoLoading(true);
			const updatedTaskResponse = await tasksAPI.getTasksById(taskId);
			if (updatedTaskResponse) {
				setSelectedTask(updatedTaskResponse);
			}
		} catch (error) {
			console.error('Error refreshing selected task:', error);
		} finally {
			setTaskInfoLoading(false);
		}
	};

	return (
		<>
			<AppHeader
				userRole={currentUserRole}
				onCalendarClick={handleCalendarClick}
				isCalendarActive={showCalendarEvents}
			/>
			<div className="container-row">
				<SideBar
					onTaskSelect={handleTaskSelect}
					onEmployeeSelect={handleEmployeeSelect}
					userRole={currentUserRole}
					userId={currentUserId}
					onTasksUpdate={refreshTasks}
					onProjectsUpdate={refreshProjects}
					releasesData={releasesData}
					departmentsData={departmentsData}
					projectsData={projects}
					employeesData={employees}
					loading={loading}
				/>

				{selectedTask ? (
					<TaskInfo
						selectedTask={selectedTask}
						userRole={currentUserRole}
						userId={currentUserId}
						statuses={statusesData}
						onStatusChange={handleStatusChange}
						projects={projects}
						employees={employees}
						onTaskUpdate={() => {
							refreshTasks();
							refreshSelectedTask(selectedTask.id);
						}}
						loading={taskInfoLoading}
					/>
				) : selectedEmployee ? (
					<EmployeeInfo
						userRole={currentUserRole}
						selectedEmployee={selectedEmployee}
						departments={departmentsData}
					/>
				) : showCalendarEvents ? (
					<CalendarEvents
						currentUser={currentUserId}
						employeeCalendar={calendarData}
						meetings={meetengsData}
					/>
				) : (
					<div style={{ flex: 1, padding: 0, margin: 0 }}>
						<div className="line-container">
							<div className="line status-primary" />
						</div>
						<Calendar status='primary' />
					</div>
				)}
			</div>
		</>
	);
}

export default MainPage;