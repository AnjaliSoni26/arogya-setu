import axios from 'axios';
import { Doctor, Appointment, TimeSlot, RegisterData } from '../types';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const doctorAPI = {
  getDoctors: async (params?: {
    specialization?: string;
    mode?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) => {
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  getDoctorById: async (id: string) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId: string, date: string, mode: string): Promise<{ slots: TimeSlot[] }> => {
    const response = await api.get('/doctors/slots', {
      params: { doctorId, date, mode }
    });
    return response.data;
  },

  getSpecializations: async () => {
    const response = await api.get('/doctors/specializations');
    return response.data;
  }
};

export const appointmentAPI = {
  bookAppointment: async (appointmentData: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationMode: string;
    symptoms?: string;
  }) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  confirmAppointment: async (appointmentId: string, otp: string) => {
    const response = await api.post(`/appointments/${appointmentId}/confirm`, { otp });
    return response.data;
  },

  getAppointments : async (params?: {
  status?: string;
  upcoming?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/appointments', { params });
  return response.data;
},


  cancelAppointment: async (appointmentId: string, reason: string) => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  rescheduleAppointment: async (appointmentId: string, newDate: string, newTime: string) => {
    const response = await api.put(`/appointments/${appointmentId}/reschedule`, {
      newDate,
      newTime
    });
    return response.data;
  }
};

export default api;