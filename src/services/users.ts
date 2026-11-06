// Saved addresses stored on-device (AsyncStorage) — no backend calls.
// Profile data lives in AuthContext (Firebase Auth).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../auth/firebaseConfig';

export type { UserProfile } from '../auth/AuthContext';

const key = () => `addresses:${auth.currentUser?.uid || 'guest'}`;

const read = async (): Promise<any[]> => {
  try {
    const raw = await AsyncStorage.getItem(key());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (list: any[]) => AsyncStorage.setItem(key(), JSON.stringify(list));

class UsersService {
  async getUserAddresses(): Promise<any[]> {
    return read();
  }

  async addUserAddress(addressData: any): Promise<any> {
    const list = await read();
    const address = { ...addressData, id: Date.now(), created_at: new Date().toISOString() };
    await write([...list, address]);
    return address;
  }

  async updateUserAddress(addressId: number, addressData: any): Promise<any> {
    const list = await read();
    const updated = list.map((a) => (a.id === addressId ? { ...a, ...addressData } : a));
    await write(updated);
    return updated.find((a) => a.id === addressId);
  }

  async deleteUserAddress(addressId: number): Promise<{ message: string }> {
    await write((await read()).filter((a) => a.id !== addressId));
    return { message: 'Address deleted' };
  }
}

export const usersApiService = new UsersService();
export default usersApiService;
