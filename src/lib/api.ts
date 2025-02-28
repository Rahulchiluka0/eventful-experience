
import axios from 'axios';

// Create axios instance with base URL and credentials
const api = axios.create({
  baseURL: import.meta.env.MODE === 'production' 
    ? '/api' 
    : 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        // If token refresh is successful, retry the original request
        if (response.status === 200) {
          // Store the new token if returned in the response
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const AuthService = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
    
  register: (userData: any) => 
    api.post('/auth/register', userData),
    
  logout: () => 
    api.post('/auth/logout').then(() => {
      localStorage.removeItem('token');
    }),
    
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Event services
export const EventService = {
  getAllEvents: (params?: any) => 
    api.get('/events', { params }),
    
  getEventById: (id: string) => 
    api.get(`/events/${id}`),
    
  createEvent: (eventData: any) => 
    api.post('/events', eventData),
    
  updateEvent: (id: string, eventData: any) => 
    api.put(`/events/${id}`, eventData),
    
  deleteEvent: (id: string) => 
    api.delete(`/events/${id}`),
    
  getOrganizerEvents: (params?: any) => 
    api.get('/events/organizer/myevents', { params }),
    
  verifyEvent: (id: string, status: string, feedbackMessage?: string) => 
    api.put(`/events/verify/${id}`, { status, feedbackMessage }),
    
  getPendingEvents: (params?: any) => 
    api.get('/events/admin/pending', { params }),
};

// Booking services
export const BookingService = {
  createBooking: (bookingData: any) => 
    api.post('/bookings', bookingData),
    
  getUserBookings: (params?: any) => 
    api.get('/bookings/my-bookings', { params }),
    
  getBookingById: (id: string) => 
    api.get(`/bookings/${id}`),
    
  cancelBooking: (id: string) => 
    api.put(`/bookings/${id}/cancel`),
    
  getEventBookings: (eventId: string, params?: any) => 
    api.get(`/bookings/event/${eventId}`, { params }),
};

// Payment services
export const PaymentService = {
  processPayment: (bookingId: string, paymentData: any) => 
    api.post(`/payments/process/${bookingId}`, paymentData),
    
  getPaymentById: (id: string) => 
    api.get(`/payments/${id}`),
    
  getBookingPaymentStatus: (bookingId: string) => 
    api.get(`/payments/booking/${bookingId}`),
};

// User services
export const UserService = {
  getUserProfile: () => 
    api.get('/users/profile'),
    
  updateUserProfile: (profileData: any) => 
    api.put('/users/profile', profileData),
    
  changePassword: (passwordData: any) => 
    api.put('/users/change-password', passwordData),
    
  getAllUsers: (params?: any) => 
    api.get('/users', { params }),
    
  verifyUser: (id: string, status: string) => 
    api.put(`/users/verify/${id}`, { status }),
    
  getPendingUsers: (params?: any) => 
    api.get('/users/pending-verification', { params }),
};

// Stall services
export const StallService = {
  getAllStallEvents: (params?: any) => 
    api.get('/stalls/events', { params }),
    
  getStallEventById: (id: string) => 
    api.get(`/stalls/events/${id}`),
    
  createStallEvent: (eventData: any) => 
    api.post('/stalls/events', eventData),
    
  updateStallEvent: (id: string, eventData: any) => 
    api.put(`/stalls/events/${id}`, eventData),
    
  addStall: (eventId: string, stallData: any) => 
    api.post(`/stalls/events/${eventId}/stalls`, stallData),
    
  getManagerStalls: () => 
    api.get('/stalls/manager/mystalls'),
    
  getOrganizerStalls: () => 
    api.get('/stalls/organizer/mystalls'),
    
  assignManager: (stallId: string, managerId: string) => 
    api.put(`/stalls/stalls/${stallId}/assign`, { managerId }),
};

// Dashboard services
export const DashboardService = {
  getAdminStats: () => 
    api.get('/dashboard/admin'),
    
  getOrganizerStats: () => 
    api.get('/dashboard/organizer'),
    
  getStallOrganizerStats: () => 
    api.get('/dashboard/stall-organizer'),
    
  getStallManagerStats: () => 
    api.get('/dashboard/stall-manager'),
    
  getUserStats: () => 
    api.get('/dashboard/user'),
};

export default api;
