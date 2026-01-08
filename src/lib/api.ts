import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),

  register: (data: any) =>
    api.post('/auth/register', data),

  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/auth/logout', { refreshToken });
  },

  getMe: () =>
    api.get('/auth/me')
};

export const vehicleAPI = {
  getAll: () =>
    api.get('/vehicles'),

  getById: (id: number) =>
    api.get(`/vehicles/${id}`),

  create: (data: any) =>
    api.post('/vehicles', data),

  update: (id: number, data: any) =>
    api.put(`/vehicles/${id}`, data),

  delete: (id: number) =>
    api.delete(`/vehicles/${id}`),

  getLocation: (id: number) =>
    api.get(`/vehicles/${id}/location`)
};

export const tripAPI = {
  getAll: (params?: any) =>
    api.get('/trips', { params }),

  getById: (id: number, includeRoute = false) =>
    api.get(`/trips/${id}`, { params: { include_route: includeRoute } }),

  getRoute: (id: number) =>
    api.get(`/trips/${id}/route`)
};

export const geofenceAPI = {
  getAll: (params?: any) =>
    api.get('/geofences', { params }),

  getById: (id: number) =>
    api.get(`/geofences/${id}`),

  create: (data: any) =>
    api.post('/geofences', data),

  update: (id: number, data: any) =>
    api.put(`/geofences/${id}`, data),

  delete: (id: number) =>
    api.delete(`/geofences/${id}`),

  assign: (id: number, vehicleIds: number[]) =>
    api.post(`/geofences/${id}/assign`, { vehicleIds })
};

export const alertAPI = {
  getAll: (params?: any) =>
    api.get('/alerts', { params }),

  getActive: (vehicleId?: number) =>
    api.get('/alerts/active', { params: vehicleId ? { vehicle_id: vehicleId } : {} }),

  acknowledge: (id: number) =>
    api.post(`/alerts/${id}/acknowledge`),

  delete: (id: number) =>
    api.delete(`/alerts/${id}`)
};

export const statsAPI = {
  getDaily: (params?: any) =>
    api.get('/stats/daily', { params }),

  getWeekly: () =>
    api.get('/stats/weekly'),

  getVehicleUsage: () =>
    api.get('/stats/vehicle-usage'),

  getSpeedData: (vehicleId?: number) =>
    api.get('/stats/speed-data', { params: vehicleId ? { vehicle_id: vehicleId } : {} })
};

export default api;
