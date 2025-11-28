import AppHeader from "../AppHeader/AppHeader";
import '@styles/styles.css'
import TaskInfo from "../TaskInfo/TaskInfo";
import SideBar from "../SideBar/SideBar";
import { useEffect, useState } from "react";
import { Colleague, ProjectItem, ReleaseItem, Status, TaskItem } from "@types";
import ColleagueInfo from "../ColleagueInfo/ColleagueInfo";
import Calendar from "../Calendar/Calendar";
import CalendarEvents from "../CalendarEvents/CalendarEvents";

const URL = process.env.HOST;

const MainPage = () => {
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
	const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null);
	const [showCalendarEvents, setShowCalendarEvents] = useState(false);
	const [statusesData, setStatusesData] = useState<Status[]>([]);

	const [currentUserRole, setCurrentUserRole] = useState<'executor' | 'manager' | 'admin' | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number>(0);
	const [releasesData, setReleasesData] = useState<ReleaseItem[]>([]);

	const [projects, setProjectsData] = useState<ProjectItem[]>([]);
	const [colleagues, setEmployeesData] = useState<Colleague[]>([]);

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

	const fetchProjects = async () => {
		try {
			const token = localStorage.getItem('auth_token');
			if (!token) return;

			const response = await fetch(`${URL}/projects/all/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'ngrok-skip-browser-warning': '0',
					"Authorization": `Bearer ${token}`,
				}
			});

			if (response.ok) {
				const projects = await response.json();
				setProjectsData(projects);
			}
		} catch (error) {
			console.error('Error fetching projects:', error);
		}
	};

	const fetchEmployees = async () => {
		try {
			const token = localStorage.getItem('auth_token');
			if (!token) return;

			const response = await fetch(`${URL}/employees/all/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'ngrok-skip-browser-warning': '0',
					"Authorization": `Bearer ${token}`,
				}
			});

			if (response.ok) {
				const employees = await response.json();
				setEmployeesData(employees);
			}
		} catch (error) {
			console.error('Error fetching employees:', error);
		}
	};

	const checkRole = async () => {
		try {
			const token = localStorage.getItem('auth_token');
			if (!token)
				return;

			const response = await fetch(`${URL}/auth/me/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'ngrok-skip-browser-warning': '0',
					"Authorization": `Bearer ${token}`,
				}
			});

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

	useEffect(() => {
		checkRole();
		const loadAllData = async () => {
			await Promise.all([fetchProjects(), fetchEmployees()]);
		};
		loadAllData();
	}, []);

	const handleTaskSelect = (task: TaskItem) => {
		setSelectedTask(task);
		setSelectedColleague(null);
		setShowCalendarEvents(false);
	};

	const handleColleagueSelect = (colleague: Colleague) => {
		setSelectedColleague(colleague);
		setSelectedTask(null);
		setShowCalendarEvents(false);
	};

	const handleCalendarClick = () => {
		setShowCalendarEvents(prev => !prev);
		setSelectedTask(null);
		setSelectedColleague(null);
	};

	const handleStatusesLoaded = (statuses: Array<{ id: number; alias: string }>) => {
		console.log('Statuses received in MainPage:', statuses);
		setStatusesData(statuses);
	};

	const handleStatusChange = async (taskId: number, newStatusId: number) => {
		try {
			const token = localStorage.getItem('auth_token');
			if (!token) {
				return;
			}
			const response = await fetch(`${URL}/tasks/update/`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'ngrok-skip-browser-warning': '0',
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					id: taskId,
					status_id: newStatusId
				})
			});

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

	const handleReleasesLoaded = (releases: ReleaseItem[]) => {
		setReleasesData(releases);
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
					onColleagueSelect={handleColleagueSelect}
					userRole={currentUserRole}
					userId={currentUserId}
					onStatusesLoaded={handleStatusesLoaded}
					onReleasesLoaded={handleReleasesLoaded}
					releasesData={releasesData}
					projects={projects}
					colleagues={colleagues}
				/>

				{selectedTask ? (
					<TaskInfo
						selectedTask={selectedTask}
						userRole={currentUserRole}
						statuses={statusesData}
						onStatusChange={handleStatusChange}
						projects={projects}
						colleagues={colleagues}
					/>
				) : selectedColleague ? (
					<ColleagueInfo
						userRole={currentUserRole}
						selectedColleague={selectedColleague}
						colleagues={colleagues}
						projects={projects}
					/>
				) : showCalendarEvents ? (
					<CalendarEvents />
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