const URL = process.env.HOST;

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '0',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const authAPI = {
  checkToken: async () => {
    const response = await fetch(`${URL}/auth/is_token_correct/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${URL}/auth/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': '0'
      },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
    return response;
  },

  logout: async () => {
    const response = await fetch(`${URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response;
  },

  getMe: async () => {
    const response = await fetch(`${URL}/auth/me/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },
};

export const tasksAPI = {
  getTasks: async () => {
    const response = await fetch(`${URL}/tasks/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getTasksById: async (taskId: number) => {
    const response = await fetch(`${URL}/tasks/get_by_id/?id=${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  createTask: async (taskData: any) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${URL}/tasks/add/`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': '0',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: taskData,

    });
    return response;
  },

  updateTask: async (taskData: any) => {
    const response = await fetch(`${URL}/tasks/update/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return response;
  },

  deleteTask: async (taskId: number) => {
    const response = await fetch(`${URL}/tasks/delete/?id=${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response;
  },

  getTaskFiles: async (fileId: number) => {
    const response = await fetch(`${URL}/files/get_by_id/?id=${fileId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },

  commentTask: async (taskId: number, text: string) => {
    const response = await fetch(`${URL}/tasks/comments/add/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ task_id: taskId, text: text })
    });
    return response;
  }
};

export const projectsAPI = {
  getProjects: async () => {
    const response = await fetch(`${URL}/projects/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  createProject: async (projectData: any) => {
    const response = await fetch(`${URL}/projects/add/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return response;
  },

  updateProject: async (projectData: any) => {
    const response = await fetch(`${URL}/projects/update/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return response;
  },
};

export const schedulesAPI = {
  getSchedules: async () => {
    const response = await fetch(`${URL}/schedules/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  }
}

export const employeesAPI = {
  getEmployees: async () => {
    const response = await fetch(`${URL}/employees/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getEmployeeCalendar: async (start: string, end: string) => {
    const response = await fetch(`${URL}/employees/calendar/mine/range/?start_date=${start}&end_date=${end}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  createEmployee: async (employeeData: any) => {
    const response = await fetch(`${URL}/auth/register/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });
    return response;
  },

  updateEmployee: async (employeeData: any) => {
    const response = await fetch(`${URL}/employees/update/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });
    return response;
  },

  getEmployeeById: async (employeeId: number) => {
    const response = await fetch(`${URL}/employees/get_by_id/?id=${employeeId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },
};

export const statusAPI = {
  getStatuses: async () => {
    const response = await fetch(`${URL}/statuses/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
}

export const meetingsAPI = {
  getMeetings: async () => {
    const response = await fetch(`${URL}/meetings/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  createMeeting: async (meetingData: any) => {
    const response = await fetch(`${URL}/meetings/add/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(meetingData)
    });
    return response;
  },

}

export const releasesAPI = {
  getReleases: async () => {
    const response = await fetch(`${URL}/releases/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  createRelease: async (releaseData: any) => {
    const response = await fetch(`${URL}/releases/add/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(releaseData)
    });
    return response;
  },

  updateRelease: async (releaseData: any) => {
    const response = await fetch(`${URL}/releases/update/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(releaseData)
    });
    return response;
  },
};

export const departmentsAPI = {
  getDepartments: async () => {
    const response = await fetch(`${URL}/departments/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  createDepartment: async (departmentData: any) => {
    const response = await fetch(`${URL}/departments/add/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(departmentData)
    });
    return response;
  },

  updateDepartment: async (departmentData: any) => {
    const response = await fetch(`${URL}/departments/update/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(departmentData)
    });
    return response;
  },
};

export const notificationsAPI = {
  getMyNotifications: async () => {
    const response = await fetch(`${URL}/notifications/my/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response;
  },

  readNotifications: async (id: number) => {
    const response = await fetch(`${URL}/notifications/read/?id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return response;
  }
}

export const dbDump = async () => {
  const response = await fetch(`${URL}/admin/db_dump/?compress=True&include_data=True`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return response;
}
