import axios from "axios";

const API_URL = "http://localhost:3000/api"; // Updated to include /api prefix

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/signin", credentials),
  register: (userData) => api.post("/auth/signup", userData),
};

export const taskAPI = {
  getAllTasks: () => api.get("/tasks"),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post("/tasks", taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const notificationAPI = {
  getUserNotifications: (userId) => api.get(`/notification/${userId}`),
  deleteNotification: (notificationId) =>
    api.delete(`/notification/${notificationId}`),
  getSingleNotification: (notificationId) =>
    api.get(`/notification/single/${notificationId}`),
  deleteAllNotifications: (userId) =>
    api.delete(`/notification/delete-all/${userId}`),
};

export default api;
