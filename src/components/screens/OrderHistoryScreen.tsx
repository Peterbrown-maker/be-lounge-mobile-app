import { ArrowLeft, ChevronRight, Clock, MapPin, Package, QrCode } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { ordersApiService, Order } from '../../services/orders';

interface OrderHistoryScreenProps {
  onBack: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderHistoryScreen = ({ onBack, onTrackOrder }: OrderHistoryScreenProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryCodeModal, setShowDeliveryCodeModal] = useState(false);

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#05070A' : '#FFF';
  const text = isDark ? '#FFF' : '#111827';
  const cardBg = isDark ? '#1F2937' : '#F9FAFB';
  const subtitleText = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = isDark ? '#4F46E5' : '#2563EB';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const fetchOrders = async () => {
    try {
      const userOrders = await ordersApiService.getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
      case 'preparing':
      case 'ready':
      case 'picked_up':
        return '#2563EB';
      default:
        return subtitleText;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const showDeliveryCode = (order: Order) => {
    setSelectedOrder(order);
    setShowDeliveryCodeModal(true);
  };

  const isActiveOrder = (status: string) => {
    return ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(status);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: subtitleText }]}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Delivery Code Modal */}
      <Modal
        visible={showDeliveryCodeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeliveryCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>Delivery Code</Text>

            {selectedOrder && (
              <>
                <View style={styles.codeContainer}>
                  <Text style={[styles.deliveryCodeText, { color: accentColor }]}>
                    {selectedOrder.delivery_code || 'N/A'}
                  </Text>
                </View>

                {selectedOrder.delivery_qr_code && (
                  <View style={styles.qrContainer}>
                    <Image
                      source={{ uri: selectedOrder.delivery_qr_code }}
                      style={styles.qrCode}
                      resizeMode="contain"
                    />
                    <Text style={[styles.qrHint, { color: subtitleText }]}>
                      Show this QR code to the driver for verification
                    </Text>
                  </View>
                )}

                <View style={styles.orderInfoModal}>
                  <Text style={[styles.orderInfoLabel, { color: subtitleText }]}>Order #{selectedOrder.id}</Text>
                  <Text style={[styles.orderInfoValue, { color: text }]}>
                    {selectedOrder.restaurant_name || 'Restaurant'}
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: accentColor }]}
              onPress={() => setShowDeliveryCodeModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accentColor]} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color={subtitleText} />
            <Text style={[styles.emptyTitle, { color: text }]}>No Orders Yet</Text>
            <Text style={[styles.emptySubtitle, { color: subtitleText }]}>
              Your order history will appear here once you place an order.
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderCard, { backgroundColor: cardBg, borderColor }]}
              onPress={() => isActiveOrder(order.status) ? onTrackOrder(order.id.toString()) : showDeliveryCode(order)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                  <Text style={[styles.orderId, { color: text }]}>Order #{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={subtitleText} />
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={16} color={subtitleText} />
                  <Text style={[styles.detailText, { color: subtitleText }]} numberOfLines={1}>
                    {order.delivery_address || 'No address'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color={subtitleText} />
                  <Text style={[styles.detailText, { color: subtitleText }]}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>
              </View>

              <View style={[styles.orderFooter, { borderTopColor: borderColor }]}>
                <Text style={[styles.totalLabel, { color: subtitleText }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: text }]}>
                  R {parseFloat(order.total_amount?.toString() || '0').toFixed(2)}
                </Text>
              </View>

              {/* Show delivery code button for delivered orders */}
              {order.status === 'delivered' && order.delivery_code && (
                <TouchableOpacity
                  style={[styles.viewCodeButton, { borderColor: accentColor }]}
                  onPress={() => showDeliveryCode(order)}
                >
                  <QrCode size={16} color={accentColor} />
                  <Text style={[styles.viewCodeText, { color: accentColor }]}>View Delivery Code</Text>
                </TouchableOpacity>
              )}

              {/* Show track button for active orders */}
              {isActiveOrder(order.status) && (
                <TouchableOpacity
                  style={[styles.trackButton, { backgroundColor: accentColor }]}
                  onPress={() => onTrackOrder(order.id.toString())}
                >
                  <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12,
  },
  viewCodeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  trackButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  codeContainer: {
    marginBottom: 24,
  },
  deliveryCodeText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCode: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  qrHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  orderInfoModal: {
    alignItems: 'center',
    marginBottom: 24,
  },
  orderInfoLabel: {
    fontSize: 14,
  },
  orderInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  closeModalButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
