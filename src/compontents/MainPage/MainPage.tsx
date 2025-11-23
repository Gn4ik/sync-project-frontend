import AppHeader from "../AppHeader/AppHeader";
import '@styles/styles.css'
import TaskInfo from "../TaskInfo/TaskInfo";
import SideBar from "../SideBar/SideBar";
import { useState } from "react";
import { Colleague, TaskItem } from "../types/types";
import ColleagueInfo from "../ColleagueInfo/ColleagueInfo";
import Calendar from "../Calendar/Calendar";
import CalendarEvents from "../CalendarEvents/CalendarEvents";

const MainPage = () => {
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
	const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null);
	const [showCalendarEvents, setShowCalendarEvents] = useState(false);

	const [currentUserRole] = useState<'user' | 'manager' | 'admin'>('manager');

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
				/>

				{selectedTask ? (
					<TaskInfo selectedTask={selectedTask} userRole={currentUserRole}/>
				) : selectedColleague ? (
					<ColleagueInfo selectedColleague={selectedColleague} />
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