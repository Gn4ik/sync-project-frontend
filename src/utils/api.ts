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

  deleteTask: async (taskData: number) => {
    const response = await fetch(`${URL}/tasks/delete/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: taskData }),
    });
    return response;
  },

  getTaskFiles: async (fileId: number) => {
    const response = await fetch(`${URL}/files/get_by_id/?id=${fileId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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

  // createProject: async (projectData: any) => {
  //   const response = await fetch(`${URL}/projects/`, {
  //     method: 'POST',
  //     headers: getAuthHeaders(),
  //     body: JSON.stringify(projectData),
  //   });
  //   return response.json();
  // },
};

export const employeesAPI = {
  getEmployees: async () => {
    const response = await fetch(`${URL}/employees/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
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

// export const meetingsAPI = {
//   getMeetings: async () => {
//     const response = await fetch(`${URL}/meetings/`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });
//     return response.json();
//   },

//   createMeeting: async (meetingData: any) => {
//     const response = await fetch(`${URL}/meetings/`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(meetingData),
//     });
//     return response.json();
//   },
// };

export const releasesAPI = {
  getReleases: async () => {
    const response = await fetch(`${URL}/releases/all/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
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
};
