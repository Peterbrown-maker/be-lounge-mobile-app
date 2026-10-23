import { ArrowLeft, Clock, MapPin, Navigation, Package } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { ordersApiService, Order } from '../../services/orders';

// Helper function to format currency from various input types
const formatCurrency = (amount: any): string => {
  if (amount === null || amount === undefined) return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface ActiveOrdersScreenProps {
  onBack: () => void;
  onTrackOrder: (orderId: string, order: Order) => void;
}

export const ActiveOrdersScreen = ({ onBack, onTrackOrder }: ActiveOrdersScreenProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#05070A' : '#FFF';
  const text = isDark ? '#FFF' : '#111827';
  const cardBg = isDark ? '#1F2937' : '#F9FAFB';
  const subtitleText = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = isDark ? '#4F46E5' : '#2563EB';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const fetchActiveOrders = async () => {
    try {
      const allOrders = await ordersApiService.getUserOrders();
      // Filter for active/incomplete orders only
      const activeOrders = allOrders.filter(order =>
        ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
      );
      // Sort by most recent first
      activeOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching active orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#3B82F6';
      case 'preparing':
        return '#8B5CF6';
      case 'ready':
        return '#10B981';
      case 'picked_up':
        return '#2563EB';
      default:
        return subtitleText;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Waiting for confirmation';
      case 'confirmed':
        return 'Order confirmed';
      case 'preparing':
        return 'Being prepared';
      case 'ready':
        return 'Ready for pickup';
      case 'picked_up':
        return 'On the way';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✓';
      case 'preparing':
        return '👨‍🍳';
      case 'ready':
        return '📦';
      case 'picked_up':
        return '🏍️';
      default:
        return '📋';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
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
        <Text style={[styles.headerTitle, { color: text }]}>Track Orders</Text>
        <View style={{ width: 24 }} />
      </View>

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
            <Text style={[styles.emptyTitle, { color: text }]}>No Active Orders</Text>
            <Text style={[styles.emptySubtitle, { color: subtitleText }]}>
              You don't have any orders in progress. Place an order to track it here.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: subtitleText }]}>
              {orders.length} Active Order{orders.length !== 1 ? 's' : ''}
            </Text>

            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => onTrackOrder(order.id.toString(), order)}
                activeOpacity={0.7}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
                    <View style={styles.orderInfo}>
                      <Text style={[styles.orderId, { color: text }]}>
                        Order #{order.id}
                      </Text>
                      <Text style={[styles.restaurantName, { color: subtitleText }]}>
                        {order.restaurant_name || 'Restaurant'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color={subtitleText} />
                    <Text style={[styles.detailText, { color: subtitleText }]} numberOfLines={1}>
                      {order.delivery_address || 'Delivery address'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Clock size={14} color={subtitleText} />
                    <Text style={[styles.detailText, { color: subtitleText }]}>
                      {formatTime(order.created_at)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.orderFooter, { borderTopColor: borderColor }]}>
                  <Text style={[styles.totalAmount, { color: text }]}>
                    R {parseFloat(order.total_amount?.toString() || '0').toFixed(2)}
                  </Text>
                  <View style={[styles.trackButton, { backgroundColor: accentColor }]}>
                    <Navigation size={14} color="#FFF" />
                    <Text style={styles.trackButtonText}>Track</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    lineHeight: 20,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
  },
  restaurantName: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
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
    fontSize: 13,
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
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
