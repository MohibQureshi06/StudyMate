import axios from 'axios';

// In development: proxy via Vite to http://localhost:5000/api
// In production: use relative /api path (served by same server)
const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Profile APIs
export const profileAPI = {
  getAll: () => api.get('/profiles'),
  getById: (id) => api.get(`/profiles/${id}`),
  create: (name) => api.post('/profiles', { name }),
  update: (id, name) => api.put(`/profiles/${id}`, { name }),
  delete: (id) => api.delete(`/profiles/${id}`)
};

// Course APIs
export const courseAPI = {
  getAll: () => api.get('/courses/list/all'),
  getSelected: (profileId) => api.get(`/courses/${profileId}/selected`),
  add: (profileId, courseId) => api.post(`/courses/${profileId}/add`, { course_id: courseId }),
  remove: (profileCourseId) => api.delete(`/courses/${profileCourseId}`),
  update: (profileCourseId, data) => api.put(`/courses/${profileCourseId}`, data),
  getDetail: (profileCourseId) => api.get(`/courses/detail/${profileCourseId}`)
};

// Lecture APIs
export const lectureAPI = {
  getAll: (profileCourseId) => api.get(`/lectures/${profileCourseId}`),
  create: (data) => api.post('/lectures', data),
  update: (lectureId, data) => api.put(`/lectures/${lectureId}`, data),
  delete: (lectureId) => api.delete(`/lectures/${lectureId}`)
};

// Topic APIs
export const topicAPI = {
  getSyllabus: (profileCourseId) => api.get(`/topics/${profileCourseId}/syllabus`),
  updateSyllabus: (profileCourseId, content) => api.put(`/topics/${profileCourseId}/syllabus`, { content }),
  getTopics: (profileCourseId) => api.get(`/topics/${profileCourseId}/topics`),
  createTopic: (profileCourseId, data) => api.post(`/topics/${profileCourseId}/topics`, data),
  updateTopic: (topicId, data) => api.put(`/topics/${topicId}`, data),
  deleteTopic: (topicId) => api.delete(`/topics/${topicId}`),
  getImportant: (profileCourseId) => api.get(`/topics/${profileCourseId}/important`),
  createImportant: (profileCourseId, data) => api.post(`/topics/${profileCourseId}/important`, data),
  updateImportant: (topicId, data) => api.put(`/topics/${topicId}/important`, data),
  deleteImportant: (topicId) => api.delete(`/topics/${topicId}/important`)
};

// Note APIs
export const noteAPI = {
  getAll: (profileCourseId) => api.get(`/notes/${profileCourseId}`),
  getDetail: (noteId) => api.get(`/notes/${noteId}/detail`),
  create: (data) => api.post('/notes', data),
  update: (noteId, data) => api.put(`/notes/${noteId}`, data),
  delete: (noteId) => api.delete(`/notes/${noteId}`)
};

// Task APIs
export const taskAPI = {
  getAll: (profileId) => api.get(`/tasks/profile/${profileId}`),
  getForCourse: (profileCourseId) => api.get(`/tasks/course/${profileCourseId}`),
  getToday: (profileId) => api.get(`/tasks/profile/${profileId}/today`),
  create: (data) => api.post('/tasks', data),
  update: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  delete: (taskId) => api.delete(`/tasks/${taskId}`)
};

// Settings APIs
export const settingsAPI = {
  get: (profileId) => api.get(`/settings/${profileId}`),
  update: (profileId, data) => api.put(`/settings/${profileId}`, data),
  export: (profileId) => api.get(`/settings/${profileId}/export`),
  import: (profileId, exportData) => api.post(`/settings/${profileId}/import`, { exportData })
};

export default api;
