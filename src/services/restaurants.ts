// Local, offline restaurant data — no backend calls.
import { ALL_MENU_ITEMS } from '../data/macnoseMenu';

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

export const MACNOSE_RESTAURANT: Restaurant = {
  id: 'macnose',
  name: 'MacNose Cafe',
  description: 'Pub & restaurant in Short Left, Soshanguve. South African classics, grills, seafood, platters and drinks. Est. 2007.',
  image: '',
  images: [],
  address: '43 Aubrey Matlakala St, Short Left, Soshanguve, 0164',
  latitude: -25.5238705,
  longitude: 28.0804518,
  rating: 0,
  delivery_time: '25-35 min',
  delivery_fee: 15,
  is_open: true,
  category: 'Pub & Restaurant',
  popular_food: 'Mogodu Monday',
  emoji: '🍽️',
  created_at: NOW,
  updated_at: NOW,
};

/** Venue details from macnosecafeshortleft.co.za. */
export const MACNOSE_INFO = {
  tagline: 'Take a Short Left',
  established: 2007,
  about:
    'Our extensive menu offers a huge variety of South African dishes specializing in African cuisine (e.g. Ox Tripe), seafood options (e.g. Oysters) & quality meat (e.g. Steak). Superior wines, premium bottles, bubbles & feel good music makes for a unique dining experience.',
  promise:
    'Good food takes time to prepare. Our food is freshly prepared to order. If you are in a hurry, have any allergies or queries, please bring it to our attention and we will do our utmost to accommodate you where possible.',
  hours: [
    { days: 'Mon – Thu', time: '10:00 – 22:00' },
    { days: 'Fri – Sat', time: '10:00 – 02:00' },
    { days: 'Sunday', time: '10:00 – 23:00' },
  ],
  website: 'https://macnosecafeshortleft.co.za/',
  facebook: 'https://www.facebook.com/p/Macnose-Cafe-Short-Left-100064692908943/',
  instagram: 'https://www.instagram.com/shortleft_soshanguve/',
  instagramHandle: '@shortleft_soshanguve',
} as const;

const RESTAURANTS: Restaurant[] = [MACNOSE_RESTAURANT];

const MENU: MenuItem[] = ALL_MENU_ITEMS.map((item) => ({
  id: item.id,
  restaurant_id: MACNOSE_RESTAURANT.id,
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
    return RESTAURANTS.find((r) => r.id === restaurantId) || MACNOSE_RESTAURANT;
  }

  // Single-restaurant app: every restaurant id gets the MacNose menu.
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
