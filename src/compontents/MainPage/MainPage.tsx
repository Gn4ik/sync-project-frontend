import AppHeader from "../AppHeader/AppHeader";
import '@styles/styles.css'
import TaskInfo from "../TaskInfo/TaskInfo";
import SideBar from "../SideBar/SideBar";
import { useState } from "react";
import { Colleague, TaskItem } from "../types/types";
import ColleagueInfo from "../ColleagueInfo/ColleagueInfo";
import Calendar from "../Calendar/Calendar";

const MainPage = () => {
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
	const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null);

	const handleTaskSelect = (task: TaskItem) => {
		setSelectedTask(task);
		setSelectedColleague(null);
	};

	const handleColleagueSelect = (colleague: Colleague) => {
		setSelectedColleague(colleague);
		setSelectedTask(null);
	};

	return (
		<>
			<AppHeader />
			<div className="container-row">
				<SideBar onTaskSelect={handleTaskSelect} onColleagueSelect={handleColleagueSelect} />
				{selectedTask ? (
					<TaskInfo selectedTask={selectedTask} />
				) : selectedColleague ? (
					<ColleagueInfo selectedColleague={selectedColleague} />
				)
					:
					<div style={{ flex: 1, padding: 0, margin: 0, }}>
						<div className="line-container">
							<div className="line status-primary" />
						</div>
						<Calendar status='primary' />
					</div>
				}
			</div>
		</>
	);
}

export default MainPage;