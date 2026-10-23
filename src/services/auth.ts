import { apiService } from './api';

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
  profile_image?: string;
}

export interface AuthResponse {
  token: string;
  user: BackendUser;
}

class AuthApiService {
  // Authenticate with Firebase UID and get JWT token
  async authenticateWithFirebase(
    firebaseUid: string,
    email: string,
    name: string,
    phone?: string
  ): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/firebase-auth', {
      firebase_uid: firebaseUid,
      email,
      name,
      phone,
    });

    // Store the JWT token
    await apiService.setToken(response.token);

    return response;
  }

  // Verify JWT token and get user data
  async verifyToken(): Promise<BackendUser> {
    const response = await apiService.get<{ user: BackendUser }>('/auth/verify');
    return response.user;
  }
}

export const authApiService = new AuthApiService();
export default authApiService;
