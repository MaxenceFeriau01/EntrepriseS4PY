import axiosInstance from '../utils/axios';

const apiService = {
  // Attendance
  checkIn: (userId) => axiosInstance.post(`/attendances/check-in/${userId}`),
  checkOut: (userId) => axiosInstance.post(`/attendances/check-out/${userId}`),
  getAttendances: () => axiosInstance.get(`/attendances`), // Pour admin - toutes les présences
  getUserAttendances: (userId) => axiosInstance.get(`/attendances/user/${userId}`), // Pour un utilisateur spécifique
  getAttendancesByDateRange: (userId, startDate, endDate) =>
    axiosInstance.get(`/attendances/user/${userId}/range`, {
      params: { startDate, endDate },
    }),
  createAttendance: (data) => axiosInstance.post(`/attendances/user/${data.userId}`, data),
  updateAttendance: (id, data) => axiosInstance.put(`/attendances/${id}`, data),
  deleteAttendance: (id) => axiosInstance.delete(`/attendances/${id}`),

  // Leave Requests
  createLeaveRequest: (userId, data) =>
    axiosInstance.post(`/leave-requests/user/${userId}`, data),
  getLeaveRequests: (userId) => axiosInstance.get(`/leave-requests/user/${userId}`),
  getAllLeaveRequests: () => axiosInstance.get(`/leave-requests`), // Pour admin - tous les congés
  getPendingLeaveRequests: () => axiosInstance.get(`/leave-requests/pending`),
  approveLeaveRequest: (id, approverId) =>
    axiosInstance.put(`/leave-requests/${id}/approve`, null, {
      params: { approverId },
    }),
  rejectLeaveRequest: (id, approverId, reason) =>
    axiosInstance.put(`/leave-requests/${id}/reject`, { reason }, {
      params: { approverId },
    }),

  // Tasks
  getTasks: (userId) => axiosInstance.get(`/tasks/user/${userId}`),
  getAllTasks: () => axiosInstance.get(`/tasks`),
  createTask: (data, createdById) =>
    axiosInstance.post(`/tasks`, data, { params: { createdById } }),
  updateTask: (id, data) => axiosInstance.put(`/tasks/${id}`, data),
  updateTaskStatus: (id, status) =>
    axiosInstance.patch(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => axiosInstance.delete(`/tasks/${id}`),

  // Messages
  getReceivedMessages: (userId) => axiosInstance.get(`/messages/received/${userId}`),
  getSentMessages: (userId) => axiosInstance.get(`/messages/sent/${userId}`),
  getUnreadMessages: (userId) => axiosInstance.get(`/messages/unread/${userId}`),
  getUnreadCount: (userId) => axiosInstance.get(`/messages/unread-count/${userId}`),
  sendMessage: (senderId, data) => axiosInstance.post(`/messages/send/${senderId}`, data),
  markAsRead: (id) => axiosInstance.patch(`/messages/${id}/read`),
  deleteMessage: (id) => axiosInstance.delete(`/messages/${id}`),

  // Users
  getAllUsers: () => axiosInstance.get(`/users`),
  getActiveUsers: () => axiosInstance.get(`/users/active`),
  getCurrentUser: () => axiosInstance.get(`/users/me`),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  updateUser: (id, data) => axiosInstance.put(`/users/${id}`, data),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
  changePassword: (userId, currentPassword, newPassword) =>
    axiosInstance.post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword
    }),
  
  // Admin
  createUser: (userData) => axiosInstance.post('/admin/users', userData),
  deactivateUser: (userId) => axiosInstance.patch(`/admin/users/${userId}/deactivate`),
  activateUser: (userId) => axiosInstance.patch(`/admin/users/${userId}/activate`),
  resetPassword: (userId, newPassword) => axiosInstance.patch(`/admin/users/${userId}/reset-password`, { newPassword }),
};

export default apiService;