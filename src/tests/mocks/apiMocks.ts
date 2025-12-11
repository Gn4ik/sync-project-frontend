export const mockAuthAPI = {
  checkToken: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
};

export const mockTasksAPI = {
  getTasks: jest.fn(),
  getTasksById: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getTaskFiles: jest.fn(),
  commentTask: jest.fn(),
};

export const mockEmployeesAPI = {
  getEmployees: jest.fn(),
  getEmployeeCalendar: jest.fn(),
  createEmployee: jest.fn(),
  updateEmployee: jest.fn(),
};

export const mockNotificationsAPI = {
  getMyNotifications: jest.fn(),
  readNotifications: jest.fn(),
};

export const mockUserAPI = {
  getMyNotifications: jest.fn(),
  getCurrentUser: jest.fn(),
  markNotificationAsRead: jest.fn(),
};

export const mockReleasesAPI = {
  getReleases: jest.fn(),
  createRelease: jest.fn(),
  updateRelease: jest.fn(),
  deleteRelease: jest.fn(),
};

export const mockProjectsAPI = {
  getProjects: jest.fn(),
  getProject: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
};

export const mockDbDump = jest.fn();