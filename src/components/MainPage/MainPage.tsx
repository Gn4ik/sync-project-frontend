import AppHeader from "../AppHeader/AppHeader";
import '@styles/styles.css'
import TaskInfo from "../TaskInfo/TaskInfo";
import SideBar from "../SideBar/SideBar";
import { useEffect, useState } from "react";
import { Colleague, TaskItem } from "@types";
import ColleagueInfo from "../ColleagueInfo/ColleagueInfo";
import Calendar from "../Calendar/Calendar";
import CalendarEvents from "../CalendarEvents/CalendarEvents";

const URL = process.env.HOST;

const MainPage = () => {
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
	const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null);
	const [showCalendarEvents, setShowCalendarEvents] = useState(false);
	const [statusesData, setStatusesData] = useState<Array<{ id: number; alias: string }>>([]);

	const [currentUserRole, setCurrentUserRole] = useState<'executor' | 'manager' | 'admin' | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number>(0);

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
					"SyncAuthToken": token,
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
			if (!token) return;

			console.log(`Changing task ${taskId} status to ${newStatusId}`);

			const response = await fetch(`${URL}/tasks/${taskId}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'ngrok-skip-browser-warning': '0',
					"SyncAuthToken": token,
				},
				body: JSON.stringify({
					status_id: newStatusId
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update task status');
			}

			const updatedTask = await response.json();
			console.log('Task status updated:', updatedTask);

			if (selectedTask && selectedTask.id === taskId) {
				setSelectedTask(prev => prev ? {
					...prev,
					status_id: newStatusId,
					status: statusesData.find(s => s.id === newStatusId) || prev.status
				} : null);
			}

		} catch (error) {
			console.error('Error updating task status:', error);
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
					onColleagueSelect={handleColleagueSelect}
					userRole={currentUserRole}
					userId={currentUserId}
					onStatusesLoaded={handleStatusesLoaded}
				/>

				{selectedTask ? (
					<TaskInfo
						selectedTask={selectedTask}
						userRole={currentUserRole}
						statuses={statusesData}
						onStatusChange={handleStatusChange}
					/>
				) : selectedColleague ? (
					<ColleagueInfo userRole={currentUserRole} selectedColleague={selectedColleague} />
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