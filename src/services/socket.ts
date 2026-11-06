// No realtime server: keeps the old socket API so screens compile, but does nothing.
type Handler = (data: any) => void;

class SocketService {
  connect() {}
  disconnect() {}
  joinOrderRoom(_orderId: string) {}
  leaveOrderRoom(_orderId: string) {}
  sendMessage(_orderId: string, _senderId: string, _senderType: 'user' | 'rider', _message: string) {}
  onMessage(_callback: Handler) {}
  offMessage() {}
  onOrderUpdate(_callback: Handler) {}
  offOrderUpdate() {}
  onRiderLocation(
    _callback: (data: { riderId: string; latitude: number; longitude: number; timestamp: Date }) => void
  ) {}
  offRiderLocation() {}
  getSocket() {
    return null;
  }
}

export const socketService = new SocketService();
export default socketService;
