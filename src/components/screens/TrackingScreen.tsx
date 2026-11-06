import { useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import * as Location from "expo-location";
import { ArrowLeft, CheckCircle, Home, MapPin, Phone, QrCode } from "lucide-react-native";
import { ordersApiService, Order } from "../../services/orders";
import { socketService } from "../../services/socket";

interface TrackingScreenProps {
  onBack: () => void;
  onComplete: () => void;
  orderId?: string;
  orderData?: Order;
}

export const TrackingScreen = ({ onBack, onComplete, orderId, orderData }: TrackingScreenProps) => {
  const [status, setStatus] = useState<string>("pending");
  const [pickupLocation, setPickupLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(orderData || null);
  const [showDeliveryCode, setShowDeliveryCode] = useState(false);
  const [riderAccepted, setRiderAccepted] = useState(false); // Only true when rider has accepted the order

  const isDark = false; // Makhanani uses a fixed black & white theme

  const bg = isDark ? '#000000' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#111111';
  const cardBg = isDark ? '#262626' : '#FAFAFA';
  const subtitleText = isDark ? '#A3A3A3' : '#737373';
  const accentColor = isDark ? '#000000' : '#000000';
  const borderColor = isDark ? '#404040' : '#E5E5E5';

  // Map backend status to display status
  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: "📋" },
    { key: "confirmed", label: "Confirmed", icon: "✓" },
    { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
    { key: "ready", label: "Ready", icon: "📦" },
    { key: "picked_up", label: "On the Way", icon: "🏍️" },
    { key: "delivered", label: "Delivered", icon: "✅" },
  ];

  const getStatusIndex = (currentStatus: string) => {
    const index = statusSteps.findIndex(s => s.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  // Statuses where rider has accepted and is actively delivering
  const riderActiveStatuses = ['picked_up', 'on_the_way', 'arriving', 'arrived'];

  // Check if rider has accepted the order
  const checkRiderAccepted = (orderStatus: string, riderId: any) => {
    return riderId && riderActiveStatuses.includes(orderStatus.toLowerCase());
  };

  // Fetch order details from backend
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        const order = await ordersApiService.getOrderDetails(parseInt(orderId));
        setOrderDetails(order);
        setStatus(order.status || 'pending');

        // Check if rider has accepted the order
        const accepted = checkRiderAccepted(order.status, order.rider_id);
        setRiderAccepted(accepted);

        // Set pickup location (restaurant location - placeholder)
        setPickupLocation({
          latitude: -25.7461, // Placeholder restaurant location
          longitude: 28.1881,
          address: order.restaurant_name || "Restaurant",
        });

        // Set dropoff location from order
        const lat = parseFloat(String(order.delivery_latitude || order.delivery_lat)) || -25.7561;
        const lng = parseFloat(String(order.delivery_longitude || order.delivery_lng)) || 28.1981;
        setDropoffLocation({
          latitude: lat,
          longitude: lng,
          address: order.delivery_address || "Delivery Location",
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Connect to Socket.IO and join order room
  useEffect(() => {
    socketService.connect();

    if (orderId) {
      socketService.joinOrderRoom(orderId);
    }

    // Listen for order status updates
    const handleOrderUpdate = (data: any) => {
      if (data.orderId === orderId || data.order_id === orderId) {
        setStatus(data.status);

        // Check if rider has now accepted (status changed to picked_up, etc.)
        const accepted = checkRiderAccepted(data.status, data.rider_id || orderDetails?.rider_id);
        setRiderAccepted(accepted);

        if (data.riderLocation) {
          setRiderLocation(data.riderLocation);
        }
        // If order is delivered, show completion after a delay
        if (data.status === 'delivered') {
          setTimeout(() => onComplete(), 2000);
        }
      }
    };

    socketService.onOrderUpdate(handleOrderUpdate);

    return () => {
      socketService.offOrderUpdate();
      socketService.disconnect();
    };
  }, [orderId, onComplete]);

  // Get current location for pickup reference
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setPickupLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: "Current Location",
        });
      }
    })();
  }, []);

  // Listen for real-time rider location updates via Socket.IO
  // Only update location if rider has accepted the order
  useEffect(() => {
    const handleRiderLocation = (data: { riderId: string; latitude: number; longitude: number; timestamp: Date }) => {
      // Only show rider location if rider has accepted the order
      if (riderAccepted) {
        console.log('Real rider location update:', data);
        setRiderLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    };

    socketService.onRiderLocation(handleRiderLocation);

    return () => {
      socketService.offRiderLocation();
    };
  }, [riderAccepted]);

  const handleMapPress = (event: any, type: "pickup" | "dropoff") => {
    const coords = event.nativeEvent.coordinate;
    // In real app: use reverse geocoding to get address
    const address = `Lat: ${coords.latitude.toFixed(5)}, Lon: ${coords.longitude.toFixed(5)}`;
    if (type === "pickup") setPickupLocation({ ...coords, address });
    else setDropoffLocation({ ...coords, address });
  };

  const currentStatusIndex = getStatusIndex(status);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      style={[styles.container, { backgroundColor: bg }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: borderColor }]}>
          <ArrowLeft size={20} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>
          Order #{orderId || orderDetails?.id || '---'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Map */}
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: Number(dropoffLocation?.latitude) || -25.7461,
            longitude: Number(dropoffLocation?.longitude) || 28.1881,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {pickupLocation && (
            <Marker
              coordinate={{ latitude: Number(pickupLocation.latitude) || -25.7461, longitude: Number(pickupLocation.longitude) || 28.1881 }}
              title="Restaurant"
              description={pickupLocation.address}
              pinColor="green"
            />
          )}
          {dropoffLocation && (
            <Marker
              coordinate={{ latitude: Number(dropoffLocation.latitude) || -25.7461, longitude: Number(dropoffLocation.longitude) || 28.1881 }}
              title="Delivery"
              description={dropoffLocation.address}
              pinColor="red"
            />
          )}
          {/* Only show rider marker when rider has accepted the order */}
          {riderAccepted && riderLocation && (
            <Marker
              coordinate={{ latitude: Number(riderLocation.latitude) || -25.7461, longitude: Number(riderLocation.longitude) || 28.1881 }}
              title="Your Rider"
              description="On the way to you"
            >
              <View style={styles.riderMarker}>
                <Text style={styles.riderEmoji}>🏍️</Text>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Rider Found Banner - Only shows when rider has accepted */}
        {riderAccepted && (
          <View style={[styles.riderFoundBanner, { backgroundColor: '#00000020', borderColor: '#000000' }]}>
            <View style={styles.riderFoundDot} />
            <Text style={styles.riderFoundText}>Rider Found! Your delivery is on the way 🏍️</Text>
          </View>
        )}

        {/* Searching for Rider Banner - Shows when order is confirmed but no rider yet */}
        {!riderAccepted && ['confirmed', 'preparing', 'ready'].includes(status) && (
          <View style={[styles.searchingRiderBanner, { backgroundColor: '#00000020', borderColor: '#000000' }]}>
            <Text style={styles.searchingRiderText}>🔍 Searching for a rider nearby...</Text>
          </View>
        )}

        {/* Order Info Card */}
        {orderDetails && (
          <View style={[styles.orderInfoCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.orderInfoRow}>
              <MapPin size={16} color={subtitleText} />
              <Text style={[styles.orderInfoText, { color: text }]} numberOfLines={2}>
                {orderDetails.delivery_address || dropoffLocation?.address || 'Delivery address'}
              </Text>
            </View>
            <View style={[styles.orderInfoRow, { marginTop: 8 }]}>
              <Text style={[styles.orderInfoLabel, { color: subtitleText }]}>Total:</Text>
              <Text style={[styles.orderInfoAmount, { color: text }]}>
                R {parseFloat(orderDetails.total_amount?.toString() || '0').toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Status Timeline */}
        <View style={[styles.statusCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.statusCardTitle, { color: text }]}>Order Status</Text>
          {statusSteps.map((step, index) => {
            const isCompleted = currentStatusIndex >= index;
            const isCurrent = currentStatusIndex === index;
            return (
              <View key={step.key} style={styles.statusRow}>
                <View
                  style={[
                    styles.statusCircle,
                    isCompleted && { backgroundColor: accentColor },
                    isCurrent && styles.statusCircleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.statusCircleText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.statusContent}>
                  <Text
                    style={[
                      styles.statusLabel,
                      { color: isCompleted ? text : subtitleText },
                      isCurrent && { fontWeight: '700' },
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Text style={[styles.statusHint, { color: accentColor }]}>Current status</Text>
                  )}
                </View>
                {index < statusSteps.length - 1 && (
                  <View
                    style={[
                      styles.statusLine,
                      isCompleted && { backgroundColor: accentColor },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Delivery Code Card */}
        {orderDetails?.delivery_code && (
          <TouchableOpacity
            style={[styles.deliveryCodeCard, { backgroundColor: cardBg, borderColor }]}
            onPress={() => setShowDeliveryCode(!showDeliveryCode)}
          >
            <View style={styles.deliveryCodeHeader}>
              <QrCode size={20} color={accentColor} />
              <Text style={[styles.deliveryCodeTitle, { color: text }]}>Delivery Code</Text>
            </View>
            {showDeliveryCode ? (
              <View style={styles.deliveryCodeContent}>
                <Text style={[styles.deliveryCodeText, { color: accentColor }]}>
                  {orderDetails.delivery_code}
                </Text>
                <Text style={[styles.deliveryCodeHint, { color: subtitleText }]}>
                  Show this code to the driver upon delivery
                </Text>
              </View>
            ) : (
              <Text style={[styles.tapToReveal, { color: subtitleText }]}>
                Tap to reveal code
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Info Note */}
        <View style={[styles.infoNote, { backgroundColor: accentColor + '15' }]}>
          <Text style={[styles.infoNoteText, { color: accentColor }]}>
            The driver will mark your order as complete when they enter your delivery code.
          </Text>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={[styles.homeButton, { borderColor: accentColor }]}
          onPress={onBack}
        >
          <Home size={18} color={accentColor} />
          <Text style={[styles.homeButtonText, { color: accentColor }]}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  map: { width, height: height * 0.3 },
  riderMarker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  riderEmoji: { fontSize: 20 },

  riderFoundBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  riderFoundDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    marginRight: 10,
  },
  riderFoundText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  searchingRiderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchingRiderText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },

  orderInfoCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  orderInfoLabel: {
    fontSize: 14,
  },
  orderInfoAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  statusCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statusCardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    position: 'relative',
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  statusCircleCurrent: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  statusCircleText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontWeight: '600',
  },
  statusContent: {
    marginLeft: 12,
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusHint: {
    fontSize: 11,
    marginTop: 2,
  },
  statusLine: {
    position: 'absolute',
    left: 13,
    top: 32,
    width: 2,
    height: 20,
    backgroundColor: "#E5E5E5",
  },

  deliveryCodeCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  deliveryCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryCodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deliveryCodeContent: {
    alignItems: 'center',
    marginTop: 16,
  },
  deliveryCodeText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  deliveryCodeHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  tapToReveal: {
    fontSize: 13,
    marginTop: 8,
  },

  infoNote: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  infoNoteText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
