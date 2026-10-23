import { apiService } from './api';

export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  phone?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  display_name?: string;
  phone?: string;
  profile_image?: string;
}

class UsersApiService {
  // Get current user profile
  async getUserProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>('/users/profile');
  }

  // Update user profile
  async updateUserProfile(userData: UpdateUserData): Promise<UserProfile> {
    return apiService.put<UserProfile>('/users/profile', userData);
  }

  // Update user profile image
  async updateProfileImage(imageUri: string): Promise<UserProfile> {
    const formData = new FormData();
    // Note: In React Native, you'll need to handle file upload differently
    // This is a placeholder for the API structure
    return apiService.put<UserProfile>('/users/profile/image', { image: imageUri });
  }

  // Get user addresses
  async getUserAddresses(): Promise<any[]> {
    return apiService.get<any[]>('/users/addresses');
  }

  // Add user address
  async addUserAddress(addressData: any): Promise<any> {
    return apiService.post<any>('/users/addresses', addressData);
  }

  // Update user address
  async updateUserAddress(addressId: number, addressData: any): Promise<any> {
    return apiService.put<any>(`/users/addresses/${addressId}`, addressData);
  }

  // Delete user address
  async deleteUserAddress(addressId: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/users/addresses/${addressId}`);
  }
}

export const usersApiService = new UsersApiService();
export default usersApiService;
