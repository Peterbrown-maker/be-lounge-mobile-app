import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  
  // Use the same IP configuration as your API service (without /api path for Socket.IO)
  private socketURL = __DEV__
    ? Platform.select({
        ios: 'https://565b2300aff0.ngrok-free.app',
        android: 'https://dca0673d229e.ngrok-free.app',
        default: 'https://565b2300aff0.ngrok-free.app',
      })
    : 'https://565b2300aff0.ngrok-free.app';
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to Socket.IO at:', this.socketURL);

    this.socket = io(this.socketURL!, {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      console.error('Check:');
      console.error('1. Is backend running on port 5000?');
      console.error('2. Is your IP address correct?');
      console.error('3. Socket URL:', this.socketURL);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected manually');
    }
  }

  // Join an order room for chat
  joinOrderRoom(orderId: string) {
    if (this.socket && this.isConnected) {
      console.log(`Joining order room: order-${orderId}`);
      this.socket.emit('join-order', orderId);
    } else {
      console.warn('Cannot join room: socket not connected');
    }
  }

  // Send a message in an order room
  sendMessage(orderId: string, senderId: string, senderType: 'user' | 'rider', message: string) {
    if (this.socket && this.isConnected) {
      console.log(`Sending message to order-${orderId}`);
      this.socket.emit('send-message', {
        orderId,
        senderId,
        senderType,
        message,
      });
    } else {
      console.warn('Cannot send message: socket not connected');
    }
  }

  // Listen for incoming messages
  onMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('receive-message', (data) => {
        console.log('Message received:', data);
        callback(data);
      });
    }
  }

  // Remove message listener
  offMessage() {
    if (this.socket) {
      this.socket.off('receive-message');
    }
  }

  // Listen for order status updates
  onOrderUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('order-update', (data) => {
        console.log('Order update received:', data);
        callback(data);
      });
    }
  }

  // Remove order update listener
  offOrderUpdate() {
    if (this.socket) {
      this.socket.off('order-update');
    }
  }

  // Listen for real-time rider location updates
  onRiderLocation(callback: (data: { riderId: string; latitude: number; longitude: number; timestamp: Date }) => void) {
    if (this.socket) {
      this.socket.on('rider-location', (data) => {
        console.log('Rider location received:', data);
        callback(data);
      });
    }
  }

  // Remove rider location listener
  offRiderLocation() {
    if (this.socket) {
      this.socket.off('rider-location');
    }
  }

  get isSocketConnected() {
    return this.isConnected;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;