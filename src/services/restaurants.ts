// Local, offline restaurant data — no backend calls.
import { ALL_MENU_ITEMS } from '../data/makhananiMenu';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  images: string[];
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  rating?: number;
  delivery_time: string;
  delivery_fee: number;
  is_open: boolean;
  category: string;
  popular_food: string;
  emoji: string;
  menuItems?: MenuItem[];
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image: any; // local require()'d asset (or a uri string)
  category: string;
  isAvailable: boolean;
  created_at: string;
  updated_at: string;
}

export interface PopularFoodCategory {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

const NOW = new Date().toISOString();

export const MAKHANANI_RESTAURANT: Restaurant = {
  id: 'makhanani',
  name: "Makhanani Shisanyama",
  description: 'Head meats, paps and good vibes',
  image: '',
  images: [],
  // TODO: Makhanani's real street address and map coordinates.
  address: '',
  latitude: -25.5,
  longitude: 28.1,
  rating: 0,
  delivery_time: '25-35 min',
  delivery_fee: 15,
  is_open: true,
  category: 'Shisanyama',
  popular_food: 'Head meats',
  emoji: '🔥',
  created_at: NOW,
  updated_at: NOW,
};

const RESTAURANTS: Restaurant[] = [MAKHANANI_RESTAURANT];

const MENU: MenuItem[] = ALL_MENU_ITEMS.map((item) => ({
  id: item.id,
  restaurant_id: MAKHANANI_RESTAURANT.id,
  name: item.name,
  description: item.description,
  price: item.price,
  image: item.image,
  category: item.category,
  isAvailable: true,
  created_at: NOW,
  updated_at: NOW,
}));

class RestaurantsService {
  async getRestaurants(): Promise<Restaurant[]> {
    return RESTAURANTS;
  }

  async getRestaurantById(restaurantId: string): Promise<Restaurant> {
    return RESTAURANTS.find((r) => r.id === restaurantId) || MAKHANANI_RESTAURANT;
  }

  // Single-restaurant app: every restaurant id gets the Makhanani menu.
  async getRestaurantMenu(_restaurantId: string): Promise<MenuItem[]> {
    return MENU;
  }

  async getPopularFoodCategories(): Promise<PopularFoodCategory[]> {
    const names = Array.from(new Set(MENU.map((m) => m.category)));
    return names.map((name, i) => ({ id: i + 1, name, emoji: '', description: '' }));
  }

  async getRestaurantsByPopularFood(_popularFood: string): Promise<Restaurant[]> {
    return RESTAURANTS;
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const q = query.trim().toLowerCase();
    if (!q) return RESTAURANTS;
    const menuHit = MENU.some((m) => m.name.toLowerCase().includes(q));
    return RESTAURANTS.filter((r) => menuHit || r.name.toLowerCase().includes(q));
  }
}

export const restaurantsApiService = new RestaurantsService();
export default restaurantsApiService;
