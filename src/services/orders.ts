import { apiService } from './api';

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
  price: number;
  special_instructions?: string;
}

export interface Order {
  id: number;
  user_id: number;
  restaurant_id: number;
  restaurant_name?: string;
  rider_id?: number;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_lat?: number;
  delivery_lng?: number;
  special_instructions?: string;
  status: string;
  delivery_code?: string;
  delivery_qr_code?: string;
  payment_status: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CreateOrderData {
  user_id: number;
  restaurant_id: number;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  special_instructions?: string;
  items: OrderItem[];
}

export interface OrderResponse {
  id: number;
  delivery_code: string;
  delivery_qr_code: string;
  message: string;
}

export interface InitializePaymentData {
  order_id: number;
  email: string;
  amount: number; // in kobo
  callback_url: string;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
  message: string;
}

export interface VerifyPaymentData {
  order_id: number;
  reference: string;
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  payment_status: string;
}

class OrdersApiService {
  // Create new order
  async createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
    try {
      // Validate data before sending
      this.validateOrderData(orderData);

      const response = await apiService.post<OrderResponse>('/orders', orderData);
      return response;
    } catch (error: any) {
      // Enhanced error logging
      console.error('Order creation failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  // Initialize Paystack payment
  async initializePayment(paymentData: InitializePaymentData): Promise<InitializePaymentResponse> {
    try {
      if (!paymentData.order_id) {
        throw new Error('Order ID is required');
      }
      if (!paymentData.email) {
        throw new Error('Email is required');
      }
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!paymentData.callback_url) {
        throw new Error('Callback URL is required');
      }

      console.log('Initializing Paystack payment:', {
        orderId: paymentData.order_id,
        email: paymentData.email,
        amount: paymentData.amount,
      });

      const response = await apiService.post<InitializePaymentResponse>(
        '/orders/payment/initialize',
        paymentData
      );

      console.log('Payment initialized successfully:', {
        reference: response.reference,
        accessCode: response.access_code,
      });

      return response;
    } catch (error: any) {
      console.error('Payment initialization failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  // Verify payment with Paystack
  async verifyPayment(orderId: number, reference: string): Promise<VerifyPaymentResponse> {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      if (!reference) {
        throw new Error('Payment reference is required');
      }

      console.log('Verifying payment:', { orderId, reference });

      const response = await apiService.post<VerifyPaymentResponse>(
        '/orders/payment/verify',
        {
          order_id: orderId,
          reference: reference,
        }
      );

      console.log('Payment verified successfully:', {
        status: response.status,
        paymentStatus: response.payment_status,
      });

      return response;
    } catch (error: any) {
      console.error('Payment verification failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  // Get user's orders
  async getUserOrders(): Promise<Order[]> {
    return apiService.get<Order[]>('/orders');
  }

  // Get order details
  async getOrderDetails(orderId: number): Promise<Order> {
    return apiService.get<Order>(`/orders/${orderId}`);
  }

  // Update order status (admin/rider only)
  async updateOrderStatus(orderId: number, status: string): Promise<{ message: string }> {
    return apiService.put<{ message: string }>(`/orders/${orderId}/status`, { status });
  }

  // Assign rider to order (admin only)
  async assignRider(orderId: number, riderId: number): Promise<{ message: string }> {
    return apiService.put<{ message: string }>(`/orders/${orderId}/rider`, { rider_id: riderId });
  }

  // Verify delivery code
  async verifyDelivery(orderId: number, deliveryCode: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/orders/${orderId}/verify-delivery`, {
      delivery_code: deliveryCode,
    });
  }

  // Find available driver for order
  async findDriver(orderId: number): Promise<{
    success: boolean;
    rider: {
      id: string;
      name: string;
      phone: string;
      vehicle: string;
      rating: number;
      currentLocation: {
        latitude: number;
        longitude: number;
      };
    };
    message: string;
  }> {
    try {
      console.log('Finding driver for order:', orderId);

      const response = await apiService.post<{
        success: boolean;
        rider: {
          id: string;
          name: string;
          phone: string;
          vehicle: string;
          rating: number;
          currentLocation: {
            latitude: number;
            longitude: number;
          };
        };
        message: string;
      }>(`/orders/${orderId}/find-driver`, {});

      console.log('Driver found:', response);
      return response;
    } catch (error: any) {
      console.error('Find driver failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  private validateOrderData(data: CreateOrderData): void {
    if (!data.user_id) throw new Error('User ID is required - not authenticated');
    if (!data.restaurant_id) throw new Error('Restaurant ID is required');
    if (!data.total_amount || data.total_amount <= 0) throw new Error('Total amount must be greater than 0');
    if (!data.delivery_address) throw new Error('Delivery address is required');
    if (typeof data.delivery_latitude !== 'number' || typeof data.delivery_longitude !== 'number') {
      throw new Error('Valid latitude and longitude are required');
    }
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('Order must contain at least one item');
    
    data.items.forEach((item, index) => {
      if (!item.menu_item_id) throw new Error(`Item ${index + 1}: menu_item_id is required`);
      if (!item.quantity || item.quantity < 1) throw new Error(`Item ${index + 1}: quantity must be at least 1`);
      if (item.price === undefined || item.price < 0) throw new Error(`Item ${index + 1}: price is required`);
    });
  }
}

export const ordersApiService = new OrdersApiService();
export default ordersApiService;