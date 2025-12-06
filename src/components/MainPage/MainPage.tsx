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

	const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number>(0);
	const [taskInfoLoading, setTaskInfoLoading] = useState(false);

	const [releasesData, setReleasesData] = useState<ReleaseItem[]>([]);
	const [projects, setProjectsData] = useState<ProjectItem[]>([]);
	const [calendarData, setCalendarData] = useState<CalendarItem[]>([]);
	const [meetengsData, setMeetingsData] = useState<Meeting[]>([]);
	const [employees, setEmployeesData] = useState<Employee[]>([]);
	const [departmentsData, setDepartmentsData] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

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

			const role = data.role.description;
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
		}
	};

	function getDateInMonth() {
		const today = new Date();
		const monthlater = new Date(today);
		monthlater.setDate(today.getDate() + 30);
		return monthlater.toISOString().split('T')[0];
	}

	const today = new Date().toISOString().split('T')[0];
	const monthLater = getDateInMonth();

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);

			try {
				await checkRole();
				const [
					releases,
					employees,
					projects,
					departments,
					statuses,
					calendar,
					meetings
				] = await Promise.allSettled([
					releasesAPI.getReleases(),
					employeesAPI.getEmployees(),
					projectsAPI.getProjects(),
					departmentsAPI.getDepartments(),
					statusAPI.getStatuses(),
					employeesAPI.getEmployeeCalendar(today, monthLater),
					meetingsAPI.getMeetings()
				]);

				setReleasesData(releases.status === 'fulfilled' ? releases.value : []);
				setEmployeesData(employees.status === 'fulfilled' ? employees.value : []);
				setProjectsData(projects.status === 'fulfilled' ? projects.value : []);
				setDepartmentsData(departments.status === 'fulfilled' ? departments.value : []);
				setStatusesData(statuses.status === 'fulfilled' ? statuses.value : []);
				setCalendarData(calendar.status === 'fulfilled' ? calendar.value : []);
				setMeetingsData(meetings.status === 'fulfilled' ? meetings.value : []);

			} catch (error) {
				console.error('Error loading data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadInitialData();
	}, [today]);

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

	const handleTaskUpdate = (selectedTask: TaskItem, mode: string) => {
		if (mode !== 'comment') {
			refreshTasks();
		}
		if (mode === 'edit' || mode === 'comment') {
			refreshSelectedTask(selectedTask.id);
		} else {
			setSelectedTask(null);
		}
	}

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
			setUpdating(true);
			const newReleases = await releasesAPI.getReleases();
			setReleasesData(newReleases);
		} catch (error) {
			console.error('Error refreshing tasks:', error);
		} finally {
			setUpdating(false);
		}
	};

	const refreshProjects = async () => {
		refreshTasks();
		try {
			const newProjects = await projectsAPI.getProjects();
			setProjectsData(newProjects);
		} catch (error) {
			console.error('Error refreshing projects:', error);
		}
	}

	const refreshMeetings = async () => {
		refreshTasks();
		try {
			const newMeetings = await meetingsAPI.getMeetings();
			setMeetingsData(newMeetings);
		} catch (error) {
			console.error('Error refreshing meetings:', error);
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

	const refreshEmployeesAndDepartments = async () => {
		try {
			const newEmployees = await employeesAPI.getEmployees();
			const newDepartments = await departmentsAPI.getDepartments();
			setEmployeesData(newEmployees);
			setDepartmentsData(newDepartments);
			if (selectedEmployee) {
				const updatedEmployee = newEmployees.find((e: Employee) => e.id === selectedEmployee.id);
				if (updatedEmployee) {
					setSelectedEmployee(updatedEmployee);
				}
			}
		} catch (error) {
			console.error('Error refreshing employees:', error);
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
					onMeetengsUpdate={refreshMeetings}
					onEmployeesUpdate={refreshEmployeesAndDepartments}
					onDepartmentsUpdate={refreshEmployeesAndDepartments}
					releasesData={releasesData}
					departmentsData={departmentsData}
					projectsData={projects}
					employeesData={employees}
					loading={loading || updating}
					statuses={statusesData}
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
						meetings={meetengsData}
						onTaskUpdate={(mode: string) => handleTaskUpdate(selectedTask, mode)}
						employeeCalendar={calendarData}
						loading={taskInfoLoading}
					/>
				) : selectedEmployee ? (
					<EmployeeInfo
						userRole={currentUserRole}
						selectedEmployee={selectedEmployee}
						departments={departmentsData}
						onEmployeeEdit={(updatedEmployee) => {
							setSelectedEmployee(updatedEmployee);
							setEmployeesData(prev => prev.map(emp =>
								emp.id === updatedEmployee.id ? updatedEmployee : emp
							));
						}}
						onEmployeeUpdate={refreshEmployeesAndDepartments}
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
						<Calendar currentUserId={currentUserId} employeeCalendar={calendarData} meetings={meetengsData} />
					</div>
				)}
			</div>
		</>
	);
}

export default MainPage;