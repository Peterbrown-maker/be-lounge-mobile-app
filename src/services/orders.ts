// Orders stored on-device (AsyncStorage) — no backend calls.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../auth/firebaseConfig';

export interface OrderItem {
  menu_item_id: number | string;
  quantity: number;
  price: number;
  special_instructions?: string;
}

export interface Order {
  id: number;
  user_id: number | string;
  restaurant_id: number | string;
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
  user_id: number | string; // Firebase uid
  restaurant_id: number | string;
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

export interface FoundRider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  currentLocation: { latitude: number; longitude: number };
}

// Orders are kept per Firebase user.
const storageKey = () => `orders:${auth.currentUser?.uid || 'guest'}`;

const readOrders = async (): Promise<Order[]> => {
  try {
    const raw = await AsyncStorage.getItem(storageKey());
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
};

const writeOrders = (orders: Order[]) =>
  AsyncStorage.setItem(storageKey(), JSON.stringify(orders));

const updateOrder = async (orderId: number, patch: Partial<Order>): Promise<Order> => {
  const orders = await readOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error('Order not found');
  orders[idx] = { ...orders[idx], ...patch, updated_at: new Date().toISOString() };
  await writeOrders(orders);
  return orders[idx];
};

const MOCK_RIDER = {
  id: '1',
  name: 'Your Rider',
  phone: '+27 12 345 6789',
  vehicle: 'Honda CBR',
  rating: 4.8,
};

class OrdersService {
  async createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
    this.validateOrderData(orderData);
    const now = new Date().toISOString();
    const id = Date.now();
    const deliveryCode = String(Math.floor(100000 + Math.random() * 900000));
    const order: Order = {
      ...orderData,
      id,
      status: 'pending',
      payment_status: 'pending',
      delivery_code: deliveryCode,
      delivery_qr_code: deliveryCode,
      created_at: now,
      updated_at: now,
    };
    await writeOrders([order, ...(await readOrders())]);
    return { id, delivery_code: deliveryCode, delivery_qr_code: deliveryCode, message: 'Order created' };
  }

  // Online card payments (Paystack) need a server holding the secret key,
  // so they are unavailable without a backend.
  async initializePayment(_paymentData: InitializePaymentData): Promise<InitializePaymentResponse> {
    throw new Error('Online payment is not available. Please choose another payment method.');
  }

  async verifyPayment(orderId: number, reference: string): Promise<VerifyPaymentResponse> {
    await updateOrder(orderId, { payment_status: 'paid', payment_reference: reference });
    return { status: 'success', message: 'Payment recorded', payment_status: 'paid' };
  }

  async getUserOrders(): Promise<Order[]> {
    return readOrders();
  }

  async getOrderDetails(orderId: number): Promise<Order> {
    const order = (await readOrders()).find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<{ message: string }> {
    await updateOrder(orderId, { status });
    return { message: 'Status updated' };
  }

  async assignRider(orderId: number, riderId: number): Promise<{ message: string }> {
    await updateOrder(orderId, { rider_id: riderId });
    return { message: 'Rider assigned' };
  }

  async verifyDelivery(orderId: number, deliveryCode: string): Promise<{ message: string }> {
    const order = await this.getOrderDetails(orderId);
    if (order.delivery_code !== deliveryCode) throw new Error('Invalid delivery code');
    await updateOrder(orderId, { status: 'delivered' });
    return { message: 'Delivery verified' };
  }

  // Simulated driver assignment (no dispatch server).
  async findDriver(orderId: number): Promise<{ success: boolean; rider: FoundRider; message: string }> {
    const order = await this.getOrderDetails(orderId).catch(() => null);
    if (order) {
      await updateOrder(orderId, { rider_id: Number(MOCK_RIDER.id), status: 'on_the_way' });
    }
    const lat = Number(order?.delivery_latitude) || -25.5;
    const lng = Number(order?.delivery_longitude) || 28.1;
    return {
      success: true,
      rider: { ...MOCK_RIDER, currentLocation: { latitude: lat + 0.005, longitude: lng + 0.003 } },
      message: 'Driver found',
    };
  }

  private validateOrderData(data: CreateOrderData): void {
    if (!data.user_id) throw new Error('Please log in to place an order');
    if (!data.restaurant_id) throw new Error('Restaurant ID is required');
    if (!data.total_amount || data.total_amount <= 0) throw new Error('Total amount must be greater than 0');
    if (!data.delivery_address) throw new Error('Delivery address is required');
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
  }
}

export const ordersApiService = new OrdersService();
export default ordersApiService;
