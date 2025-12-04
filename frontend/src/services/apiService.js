import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const apiService = {
  // Attendance
  checkIn: (userId) => axios.post(`${API_URL}/attendances/check-in/${userId}`),
  checkOut: (userId) => axios.post(`${API_URL}/attendances/check-out/${userId}`),
  getAttendances: (userId) => axios.get(`${API_URL}/attendances/user/${userId}`),
  getAttendancesByDateRange: (userId, startDate, endDate) =>
    axios.get(`${API_URL}/attendances/user/${userId}/range`, {
      params: { startDate, endDate },
    }),

  // Leave Requests
  createLeaveRequest: (userId, data) =>
    axios.post(`${API_URL}/leave-requests/user/${userId}`, data),
  getLeaveRequests: (userId) => axios.get(`${API_URL}/leave-requests/user/${userId}`),
  getPendingLeaveRequests: () => axios.get(`${API_URL}/leave-requests/pending`),
  approveLeaveRequest: (id, approverId) =>
    axios.put(`${API_URL}/leave-requests/${id}/approve`, null, {
      params: { approverId },
    }),
  rejectLeaveRequest: (id, approverId, reason) =>
    axios.put(`${API_URL}/leave-requests/${id}/reject`, { reason }, {
      params: { approverId },
    }),

  // Tasks
  getTasks: (userId) => axios.get(`${API_URL}/tasks/user/${userId}`),
  getAllTasks: () => axios.get(`${API_URL}/tasks`),
  createTask: (data, createdById) =>
    axios.post(`${API_URL}/tasks`, data, { params: { createdById } }),
  updateTask: (id, data) => axios.put(`${API_URL}/tasks/${id}`, data),
  updateTaskStatus: (id, status) =>
    axios.patch(`${API_URL}/tasks/${id}/status`, { status }),
  deleteTask: (id) => axios.delete(`${API_URL}/tasks/${id}`),

  // Messages
  getReceivedMessages: (userId) => axios.get(`${API_URL}/messages/received/${userId}`),
  getSentMessages: (userId) => axios.get(`${API_URL}/messages/sent/${userId}`),
  getUnreadMessages: (userId) => axios.get(`${API_URL}/messages/unread/${userId}`),
  getUnreadCount: (userId) => axios.get(`${API_URL}/messages/unread-count/${userId}`),
  sendMessage: (senderId, data) => axios.post(`${API_URL}/messages/send/${senderId}`, data),
  markAsRead: (id) => axios.patch(`${API_URL}/messages/${id}/read`),
  deleteMessage: (id) => axios.delete(`${API_URL}/messages/${id}`),

  // Users
  getAllUsers: () => axios.get(`${API_URL}/users`),
  getActiveUsers: () => axios.get(`${API_URL}/users/active`),
  getCurrentUser: () => axios.get(`${API_URL}/users/me`),
  getUserById: (id) => axios.get(`${API_URL}/users/${id}`),
  updateUser: (id, data) => axios.put(`${API_URL}/users/${id}`, data),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`),
};

export default apiService;