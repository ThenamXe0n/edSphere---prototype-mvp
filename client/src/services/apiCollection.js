import axiosInstance from '../utils/axiosInstance';

// ==========================================
// Authentication APIs
// ==========================================
export const loginApi = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const meApi = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const logoutApi = async () => {
  // Let's create a logout endpoint on backend that clears the cookie,
  // but if we call it, we also clear the in-memory access token.
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error) {
    // If backend endpoint is missing, return success to let frontend sign out
    return { status: 'success' };
  }
};

// ==========================================
// Student APIs (Supports FormData for Images)
// ==========================================
export const createStudentApi = async (formData) => {
  const response = await axiosInstance.post('/students', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllStudentsApi = async (params = {}) => {
  const response = await axiosInstance.get('/students', { params });
  return response.data;
};

export const getStudentByIdApi = async (id) => {
  const response = await axiosInstance.get(`/students/${id}`);
  return response.data;
};

export const updateStudentApi = async (id, formData) => {
  const response = await axiosInstance.put(`/students/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteStudentApi = async (id) => {
  const response = await axiosInstance.delete(`/students/${id}`);
  return response.data;
};

// ==========================================
// Teacher APIs
// ==========================================
export const getAllTeachersApi = async (params = {}) => {
  const response = await axiosInstance.get('/users/teachers', { params });
  return response.data;
};

export const createTeacherApi = async (teacherData) => {
  const response = await axiosInstance.post('/users/teachers', teacherData);
  return response.data;
};

// ==========================================
// Course & LMS APIs
// ==========================================
export const createCourseApi = async (formData) => {
  const response = await axiosInstance.post('/courses', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllCoursesApi = async (params = {}) => {
  const response = await axiosInstance.get('/courses', { params });
  return response.data;
};

export const getCourseByIdApi = async (id) => {
  const response = await axiosInstance.get(`/courses/${id}`);
  return response.data;
};

export const updateCourseApi = async (id, formData) => {
  const response = await axiosInstance.put(`/courses/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCourseApi = async (id) => {
  const response = await axiosInstance.delete(`/courses/${id}`);
  return response.data;
};

// ==========================================
// Lesson APIs
// ==========================================
export const addLessonApi = async (courseId, lessonData) => {
  const response = await axiosInstance.post(`/courses/${courseId}/lessons`, lessonData);
  return response.data;
};

export const updateLessonApi = async (courseId, lessonId, lessonData) => {
  const response = await axiosInstance.put(`/courses/${courseId}/lessons/${lessonId}`, lessonData);
  return response.data;
};

export const deleteLessonApi = async (courseId, lessonId) => {
  const response = await axiosInstance.delete(`/courses/${courseId}/lessons/${lessonId}`);
  return response.data;
};

// ==========================================
// Student Progress APIs
// ==========================================
export const markLessonCompleteApi = async (courseId, lessonId) => {
  const response = await axiosInstance.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  return response.data;
};

export const getCourseProgressApi = async (courseId, studentId = '') => {
  const response = await axiosInstance.get(`/courses/${courseId}/progress`, {
    params: studentId ? { studentId } : {},
  });
  return response.data;
};

// ==========================================
// Attendance APIs
// ==========================================
export const recordAttendanceApi = async (attendanceData) => {
  const response = await axiosInstance.post('/attendance', attendanceData);
  return response.data;
};

export const getStudentAttendanceApi = async (studentId) => {
  const response = await axiosInstance.get(`/attendance/student/${studentId}`);
  return response.data;
};

// ==========================================
// Institute APIs (Super Admin only)
// ==========================================
export const getAllInstitutesApi = async () => {
  const response = await axiosInstance.get('/institutes');
  return response.data;
};

export const createInstituteApi = async (instituteData) => {
  const response = await axiosInstance.post('/institutes', instituteData);
  return response.data;
};
