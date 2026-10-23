import { apiService } from './api';

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
  image: string;
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

/**
 * Extract data from wrapped API response
 */
const extractData = <T,>(response: any): T => {
  console.log('Extracting data from response:', response);

  if (response && typeof response === 'object' && response.data !== undefined) {
    console.log('Extracted data property:', response.data);
    return response.data as T;
  }

  console.log('Using response directly as data');
  return response as T;
};

class RestaurantsApiService {
  /**
   * Parse images from string or array to array of strings
   */
  private parseImages(imagesData: any): string[] {
    if (!imagesData) {
      console.log('RestaurantsApiService: No images data provided');
      return [];
    }

    // If it's already an array, validate and return
    if (Array.isArray(imagesData)) {
      const validImages = imagesData.filter(img => 
        img && typeof img === 'string' && img.length > 0
      );
      console.log(`RestaurantsApiService: Parsed array, ${validImages.length} valid images`);
      return validImages;
    }

    // If it's a JSON string, try to parse it
    if (typeof imagesData === 'string') {
      // Check if it looks like JSON
      if (imagesData.startsWith('[')) {
        try {
          const parsed = JSON.parse(imagesData);
          if (Array.isArray(parsed)) {
            const validImages = parsed.filter(img => 
              img && typeof img === 'string' && img.length > 0
            );
            console.log(`RestaurantsApiService: Parsed JSON string, ${validImages.length} valid images`);
            return validImages;
          }
        } catch (e) {
          console.warn('RestaurantsApiService: Failed to parse images JSON:', e);
        }
      } else if (imagesData.length > 0) {
        // Single image string
        console.log('RestaurantsApiService: Single image string detected');
        return [imagesData];
      }
    }

    console.log('RestaurantsApiService: Could not parse images');
    return [];
  }

  /**
   * Get all restaurants
   */
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      console.log('RestaurantsApiService: Fetching all restaurants');
      const response = await apiService.get<any>('/restaurants');
      const restaurants = extractData<Restaurant[]>(response);

      if (!Array.isArray(restaurants)) {
        console.warn('Restaurants response is not an array:', restaurants);
        return [];
      }

      // Parse images for all restaurants
      const restaurantsWithImages = restaurants.map(r => ({
        ...r,
        images: this.parseImages(r.images)
      }));

      console.log(`RestaurantsApiService: Successfully fetched ${restaurantsWithImages.length} restaurants`);
      return restaurantsWithImages;
    } catch (error) {
      console.error('RestaurantsApiService: Error fetching restaurants:', error);
      throw error;
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(restaurantId: string): Promise<Restaurant> {
    try {
      console.log(`RestaurantsApiService: Fetching restaurant ${restaurantId}`);
      const response = await apiService.get<any>(`/restaurants/${restaurantId}`);
      const restaurant = extractData<Restaurant>(response);

      console.log(`RestaurantsApiService: Successfully fetched restaurant ${restaurantId}`);
      return {
        ...restaurant,
        images: this.parseImages(restaurant.images)
      };
    } catch (error) {
      console.error('RestaurantsApiService: Error fetching restaurant:', error);
      throw error;
    }
  }

  /**
   * Get restaurant menu items with images
   */
  async getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    try {
      console.log(`RestaurantsApiService: Fetching menu for restaurant ${restaurantId}`);
      const response = await apiService.get<any>(`/menu?restaurant_id=${restaurantId}`);

      console.log('RestaurantsApiService: Raw menu response:', response);

      const menuData = extractData<any[]>(response);

      if (!Array.isArray(menuData)) {
        console.warn('RestaurantsApiService: Menu data is not an array:', menuData);
        return [];
      }

      const menuWithImages = menuData.map((item: any) => ({
        id: String(item.id),
        restaurant_id: String(item.restaurant_id),
        name: item.name || '',
        description: item.description || '',
        price: parseFloat(String(item.price)) || 0,
        image: formatImageUrl(item.image),
        category: item.category || 'Main',
        isAvailable: item.isAvailable !== false,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      console.log(`RestaurantsApiService: Successfully fetched ${menuWithImages.length} menu items`);
      return menuWithImages;
    } catch (error) {
      console.error('RestaurantsApiService: Error fetching menu:', error);
      return [];
    }
  }

  /**
   * Get all popular food categories
   */
  async getPopularFoodCategories(): Promise<PopularFoodCategory[]> {
    try {
      console.log('RestaurantsApiService: Fetching popular food categories');
      const response = await apiService.get<any>('/restaurants/categories/all');

      console.log('RestaurantsApiService: Raw categories response:', response);

      const categoriesData = extractData<any[]>(response);

      if (!Array.isArray(categoriesData)) {
        console.warn('RestaurantsApiService: Categories data is not an array:', categoriesData);
        return [];
      }

      const formattedCategories = categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        emoji: formatImageUrl(cat.emoji),
        description: cat.description || '',
      }));

      console.log(`RestaurantsApiService: Successfully fetched ${formattedCategories.length} food categories`);
      return formattedCategories;
    } catch (error) {
      console.error('RestaurantsApiService: Error fetching popular food categories:', error);
      throw error;
    }
  }

  /**
   * Get restaurants by popular food category
   */
  async getRestaurantsByPopularFood(popularFood: string): Promise<Restaurant[]> {
    try {
      console.log(`RestaurantsApiService: Fetching restaurants by category ${popularFood}`);
      const response = await apiService.get<any>(
        `/restaurants/category/${encodeURIComponent(popularFood)}`
      );

      const restaurants = extractData<Restaurant[]>(response);

      if (!Array.isArray(restaurants)) {
        console.warn('RestaurantsApiService: Restaurants data is not an array:', restaurants);
        return [];
      }

      // Parse images for all restaurants
      const restaurantsWithImages = restaurants.map(r => ({
        ...r,
        images: this.parseImages(r.images)
      }));

      console.log(`RestaurantsApiService: Successfully fetched ${restaurantsWithImages.length} restaurants for ${popularFood}`);
      return restaurantsWithImages;
    } catch (error) {
      console.error('RestaurantsApiService: Error fetching restaurants by category:', error);
      throw error;
    }
  }

  /**
   * Search restaurants
   */
  async searchRestaurants(query: string): Promise<Restaurant[]> {
    try {
      console.log(`RestaurantsApiService: Searching for "${query}"`);
      const response = await apiService.get<any>(
        `/restaurants/search?q=${encodeURIComponent(query)}`
      );

      const restaurants = extractData<Restaurant[]>(response);

      if (!Array.isArray(restaurants)) {
        console.warn('RestaurantsApiService: Search results are not an array:', restaurants);
        return [];
      }

      // Parse images for all restaurants
      const restaurantsWithImages = restaurants.map(r => ({
        ...r,
        images: this.parseImages(r.images)
      }));

      console.log(`RestaurantsApiService: Search found ${restaurantsWithImages.length} restaurants`);
      return restaurantsWithImages;
    } catch (error) {
      console.error('RestaurantsApiService: Error searching restaurants:', error);
      throw error;
    }
  }
}

/**
 * Format image URLs to proper data URLs
 */
const formatImageUrl = (image: string | null | undefined): string => {
  if (!image) return '';

  if (typeof image === 'string' && image.startsWith('data:')) {
    return image;
  }

  if (typeof image === 'string' && image.length > 0) {
    return `data:image/jpeg;base64,${image}`;
  }

  return '';
};

export const restaurantsApiService = new RestaurantsApiService();
export default restaurantsApiService;