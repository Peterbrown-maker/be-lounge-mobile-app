import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';

class ApiService {
  private api: AxiosInstance;
  // Use the Expo server IP (172.20.10.2) as a reference for your network
  // Replace with your actual computer's IP address
  private baseURL = __DEV__
    ? Platform.select({
        // For iOS simulator, localhost works
        ios: 'https://dca0673d229e.ngrok-free.app/api',
        // For Android emulator, use 10.0.2.2
        android: 'https://dca0673d229e.ngrok-free.app/api',
        // For physical devices, use your computer's IP
        // You can find this with: ipconfig (Windows) or ifconfig (Mac/Linux)
        default: 'https://565b2300aff0.ngrok-free.app/api',
      })
    : 'https://565b2300aff0.ngrok-free.app/api'; // Production URL

  constructor() {
    console.log('API Base URL:', this.baseURL);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error) => {
        if (error.code === 'ECONNABORTED') {
          console.error('Request timeout - backend might be slow or down');
        } else if (error.message === 'Network Error') {
          console.error('Network Error - Check:');
          console.error('1. Is backend running on port 5000?');
          console.error('2. Is your IP address correct?');
          console.error('3. Are you on the same network?');
          console.error('Current baseURL:', this.baseURL);
        }

        const originalRequest = error.config;

        // Handle 401 - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const currentToken = await AsyncStorage.getItem('authToken');
            if (currentToken) {
              console.log('Token expired, attempting refresh...');

              // Attempt to refresh the token
              const refreshResponse = await axios.post(
                `${this.baseURL}/auth/refresh`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${currentToken}`,
                  },
                }
              );

              const newToken = refreshResponse.data.token;
              await AsyncStorage.setItem('authToken', newToken);
              console.log('Token refreshed successfully');

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.log('Token refresh failed, clearing auth token');
            await AsyncStorage.removeItem('authToken');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Set auth token manually
  async setToken(token: string) {
    await AsyncStorage.setItem('authToken', token);
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(endpoint);
    return response.data;
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(endpoint, data);
    return response.data;
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(endpoint, data);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(endpoint);
    return response.data;
  }

  // Test connection to backend
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      console.log('Backend health check successful:', response.data);
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;