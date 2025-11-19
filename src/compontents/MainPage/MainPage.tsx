import AppHeader from "../AppHeader/AppHeader";
import '@styles/styles.css'
import TaskInfo from "../TaskInfo/TaskInfo";
import SideBar from "../SideBar/SideBar";
import { useState } from "react";
import { TaskItem } from "../types/types";

const MainPage = () => {
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
	return (
		<>
			<AppHeader />
			<div className="container-row">
				<SideBar onTaskSelect={setSelectedTask} />
				<TaskInfo selectedTask={selectedTask} />
			</div>
		</>
	);
}

export default MainPage;