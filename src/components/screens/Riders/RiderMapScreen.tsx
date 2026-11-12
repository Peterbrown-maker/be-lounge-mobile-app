import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  PanResponder,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { ArrowLeft, Bike, Clock, Star, Phone, MessageCircle, ChevronDown, Navigation, MapPin } from "lucide-react-native";
import { useAuth } from "../../../auth/AuthContext";
import { ordersApiService, Order } from "../../../services/orders";
import { socketService } from "../../../services/socket";

const { width, height } = Dimensions.get("window");

// MacNose service area coordinates
const DELIVERY_AREA_CENTER = {
  latitude: -25.5238705,
  longitude: 28.0804518,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Bottom sheet snap points
const SNAP_POINTS = {
  CLOSED: height,
  PEEK: height - 180,
  HALF: height * 0.4,
  FULL: 100,
};

interface AssignedRider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

interface ActiveOrderWithRider {
  order: Order;
  rider: AssignedRider;
}

// Generate random riders for display when no active order
const generateRiders = (count: number) => {
  const riderNames = [
    "Thabo", "Sipho", "Lerato", "Karabo", "Mpho", "Kagiso",
    "Tshepo", "Kgotso", "Refilwe", "Tebogo", "Dineo", "Tumi"
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `rider-${i}`,
    name: riderNames[i],
    latitude: DELIVERY_AREA_CENTER.latitude + (Math.random() - 0.5) * 0.06,
    longitude: DELIVERY_AREA_CENTER.longitude + (Math.random() - 0.5) * 0.06,
    status: Math.random() > 0.3 ? "available" : "busy",
    deliveries: Math.floor(Math.random() * 50) + 10,
    rating: (4 + Math.random()).toFixed(1),
    bio: "Experienced delivery rider serving the Soshanguve area",
    recentDeliveries: Math.floor(Math.random() * 5) + 3,
  }));
};

interface RiderMarkerProps {
  rider: any;
  isSelected: boolean;
  onPress: () => void;
  isAssignedRider?: boolean;
}

const RiderMarker = ({ rider, isSelected, onPress, isAssignedRider }: RiderMarkerProps) => (
  <Marker
    key={rider.id}
    coordinate={{
      latitude: Number(rider.latitude || rider.currentLocation?.latitude) || 0,
      longitude: Number(rider.longitude || rider.currentLocation?.longitude) || 0
    }}
    onPress={onPress}
    tracksViewChanges={false}
  >
    <View style={styles.markerContainer}>
      {isAssignedRider ? (
        <View style={[styles.assignedMarkerDot, { transform: [{ scale: isSelected ? 1.3 : 1 }] }]}>
          <Text style={styles.motorcycleEmoji}>🏍️</Text>
        </View>
      ) : (
        <View style={[styles.markerDot, { backgroundColor: rider.status === "available" ? "#000000" : "#000000", transform: [{ scale: isSelected ? 1.3 : 1 }] }]}>
          <Bike size={18} color="#FFFFFF" />
        </View>
      )}
    </View>
  </Marker>
);

interface RiderMapScreenProps {
  onBack: () => void;
}

export default function RiderMapScreen({ onBack }: RiderMapScreenProps) {
  const [riders, setRiders] = useState(generateRiders(12));
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [mapInteractionEnabled, setMapInteractionEnabled] = useState(true);
  const [activeOrderWithRider, setActiveOrderWithRider] = useState<ActiveOrderWithRider | null>(null);
  const [loading, setLoading] = useState(true);
  const isDark = false; // MacNose uses a fixed light theme
  const { user } = useAuth();

  const mapRef = useRef<MapView>(null);
  const sheetPosition = useRef(new Animated.Value(SNAP_POINTS.CLOSED)).current;
  const lastGesture = useRef(SNAP_POINTS.CLOSED);
  const scrollViewRef = useRef<ScrollView>(null);

  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const cardBg = isDark ? "#262626" : "#FAFAFA";
  const borderColor = isDark ? "#404040" : "#E5E5E5";
  const subtitleText = isDark ? "#A3A3A3" : "#737373";
  const accentColor = isDark ? "#000000" : "#000000";

  const availableRiders = riders.filter(r => r.status === "available").length;
  const busyRiders = riders.filter(r => r.status === "busy").length;

  // Fetch active orders and check for assigned rider
  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orders = await ordersApiService.getUserOrders();

        // Find an active order where rider has ACCEPTED (picked_up or on_the_way)
        // Rider is only shown on map after they accept the order
        const riderAcceptedStatuses = ['picked_up', 'on_the_way', 'arriving', 'arrived'];
        const activeOrder = orders.find(
          (order) => riderAcceptedStatuses.includes(order.status.toLowerCase()) && order.rider_id
        );

        if (activeOrder && activeOrder.rider_id) {
          // Fetch rider details - for now we'll create mock data based on rider_id
          // In production, you'd have an API endpoint to get rider details
          const mockRider: AssignedRider = {
            id: activeOrder.rider_id.toString(),
            name: "Your Rider",
            phone: "+27 12 345 6789",
            vehicle: "Honda CBR",
            rating: 4.8,
            currentLocation: {
              latitude: parseFloat(String(activeOrder.delivery_latitude || activeOrder.delivery_lat)) || DELIVERY_AREA_CENTER.latitude + 0.005,
              longitude: parseFloat(String(activeOrder.delivery_longitude || activeOrder.delivery_lng)) || DELIVERY_AREA_CENTER.longitude + 0.003,
            },
          };

          setActiveOrderWithRider({
            order: activeOrder,
            rider: mockRider,
          });

          // Auto-show the rider card
          setTimeout(() => {
            animateToSnapPoint(SNAP_POINTS.PEEK);
            mapRef.current?.animateToRegion({
              latitude: mockRider.currentLocation.latitude,
              longitude: mockRider.currentLocation.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }, 1000);
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching active orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrder();
  }, [user]);

  const animateToSnapPoint = useCallback((snapPoint: number) => {
    lastGesture.current = snapPoint;
    Animated.spring(sheetPosition, {
      toValue: snapPoint,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [sheetPosition]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        sheetPosition.setOffset(lastGesture.current);
        sheetPosition.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 || lastGesture.current > SNAP_POINTS.FULL) {
          sheetPosition.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        sheetPosition.flattenOffset();
        const currentPosition = lastGesture.current + gestureState.dy;
        let snapTo;

        if (gestureState.dy > 0) {
          if (currentPosition > SNAP_POINTS.PEEK - 50) snapTo = SNAP_POINTS.CLOSED;
          else if (currentPosition > SNAP_POINTS.HALF - 100) snapTo = SNAP_POINTS.PEEK;
          else snapTo = SNAP_POINTS.HALF;
        } else {
          if (currentPosition < SNAP_POINTS.FULL + 50) snapTo = SNAP_POINTS.FULL;
          else if (currentPosition < SNAP_POINTS.HALF + 100) snapTo = SNAP_POINTS.HALF;
          else snapTo = SNAP_POINTS.PEEK;
        }

        animateToSnapPoint(snapTo);
      },
    })
  ).current;

  const handleRiderPress = useCallback((rider: any) => {
    // If user has active order, don't allow selecting other riders
    if (activeOrderWithRider) return;

    setSelectedRider(rider);
    setMapInteractionEnabled(false);
    animateToSnapPoint(SNAP_POINTS.HALF);
    mapRef.current?.animateToRegion({
      latitude: Number(rider.latitude) || DELIVERY_AREA_CENTER.latitude,
      longitude: Number(rider.longitude) || DELIVERY_AREA_CENTER.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 1000);
  }, [animateToSnapPoint, activeOrderWithRider]);

  const closeBottomSheet = useCallback(() => {
    // Don't close if user has active order
    if (activeOrderWithRider) {
      animateToSnapPoint(SNAP_POINTS.PEEK);
      return;
    }
    animateToSnapPoint(SNAP_POINTS.CLOSED);
    setMapInteractionEnabled(true);
    setTimeout(() => setSelectedRider(null), 300);
  }, [animateToSnapPoint, activeOrderWithRider]);

  // Simulate rider movement when no active order
  useEffect(() => {
    if (!selectedRider && !activeOrderWithRider) {
      const interval = setInterval(() => {
        setRiders(prev =>
          prev.map(rider => ({
            ...rider,
            latitude: rider.latitude + (Math.random() - 0.5) * 0.002,
            longitude: rider.longitude + (Math.random() - 0.5) * 0.002,
          }))
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRider, activeOrderWithRider]);

  // Connect to Socket.IO and listen for real rider location updates
  useEffect(() => {
    if (activeOrderWithRider) {
      // Connect to socket and join order room
      socketService.connect();
      socketService.joinOrderRoom(activeOrderWithRider.order.id.toString());

      // Listen for real-time rider location updates
      const handleRiderLocation = (data: { riderId: string; latitude: number; longitude: number; timestamp: Date }) => {
        console.log('[RiderMapScreen] Real rider location update:', data);
        setActiveOrderWithRider(prev => {
          if (!prev) return null;
          return {
            ...prev,
            rider: {
              ...prev.rider,
              currentLocation: {
                latitude: data.latitude,
                longitude: data.longitude,
              },
            },
          };
        });

        // Optionally animate map to follow rider
        mapRef.current?.animateToRegion({
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 500);
      };

      socketService.onRiderLocation(handleRiderLocation);

      return () => {
        socketService.offRiderLocation();
      };
    }
  }, [activeOrderWithRider?.order.id]);

  const handleCallRider = () => {
    if (activeOrderWithRider?.rider.phone) {
      Linking.openURL(`tel:${activeOrderWithRider.rider.phone}`);
    }
  };

  const handleMessageRider = () => {
    if (activeOrderWithRider?.rider.phone) {
      Linking.openURL(`sms:${activeOrderWithRider.rider.phone}`);
    }
  };

  const handleContactDisabled = () => {
    Alert.alert(
      "No Active Order",
      "You need to place an order first before you can contact a rider.",
      [{ text: "OK" }]
    );
  };

  const mapStyle = isDark ? [
    { elementType: "geometry", stylers: [{ color: "#262626" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#A3A3A3" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#262626" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#404040" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0A0A0A" }] },
  ] : [];

  const backdropOpacity = sheetPosition.interpolate({
    inputRange: [SNAP_POINTS.FULL, SNAP_POINTS.CLOSED],
    outputRange: [0.7, 0],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: text }]}>Loading...</Text>
      </View>
    );
  }

  // Render the assigned rider card (DriverFoundScreen style)
  const renderAssignedRiderCard = () => {
    if (!activeOrderWithRider) return null;
    const { rider, order } = activeOrderWithRider;

    return (
      <>
        {/* Driver Found Header */}
        <View style={styles.sheetHeader}>
          <View style={styles.driverFoundHeader}>
            <Text style={[styles.driverFoundText, { color: accentColor }]}>
              Your Rider is On The Way! 🏍️
            </Text>
            <View style={styles.ratingBadge}>
              <Star size={14} color="#000000" fill="#000000" />
              <Text style={styles.ratingBadgeText}>{rider.rating}</Text>
            </View>
          </View>
        </View>

        {/* Rider Info */}
        <View style={styles.assignedRiderInfo}>
          <View style={[styles.riderAvatarLarge, { backgroundColor: accentColor }]}>
            <Text style={styles.riderInitialLarge}>{rider.name.charAt(0)}</Text>
          </View>
          <View style={styles.riderDetails}>
            <Text style={[styles.riderNameLarge, { color: text }]}>{rider.name}</Text>
            <Text style={[styles.vehicleInfo, { color: subtitleText }]}>
              White Motorcycle • {rider.vehicle}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={[styles.orderInfoCard, { backgroundColor: isDark ? '#404040' : '#F5F5F5', borderColor }]}>
          <Text style={[styles.orderLabel, { color: subtitleText }]}>
            Order #{order.id}
          </Text>
          <View style={styles.addressRow}>
            <MapPin size={16} color={accentColor} />
            <Text style={[styles.deliveryAddressText, { color: text }]} numberOfLines={2}>
              {order.delivery_address}
            </Text>
          </View>
        </View>

        {/* Live Tracking Status */}
        <View style={[styles.liveTrackingBadge, { backgroundColor: '#00000020' }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTrackingText}>Live Tracking Active</Text>
        </View>

        {/* Action Buttons - Enabled for active order */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButtonLarge, { backgroundColor: accentColor }]}
            onPress={handleCallRider}
          >
            <Phone size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonTextWhite}>Call Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButtonLarge, styles.secondaryButtonLarge, { borderColor: accentColor }]}
            onPress={handleMessageRider}
          >
            <MessageCircle size={20} color={accentColor} />
            <Text style={[styles.actionButtonTextColored, { color: accentColor }]}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Code */}
        {order.delivery_code && (
          <View style={[styles.deliveryCodeCard, { backgroundColor: isDark ? '#404040' : '#F5F5F5' }]}>
            <Text style={[styles.deliveryCodeLabel, { color: subtitleText }]}>Delivery Code</Text>
            <Text style={[styles.deliveryCodeValue, { color: text }]}>{order.delivery_code}</Text>
          </View>
        )}
      </>
    );
  };

  // Render the generic rider card (no active order)
  const renderGenericRiderCard = () => {
    if (!selectedRider) {
      return (
        <Text style={{ textAlign: "center", padding: 20, color: subtitleText }}>
          Select a rider to see details
        </Text>
      );
    }

    return (
      <>
        {/* Rider Header */}
        <View style={styles.sheetHeader}>
          <View style={styles.riderHeaderRow}>
            <View style={[styles.riderAvatar, { backgroundColor: selectedRider.status === "available" ? "#000000" : "#000000" }]}>
              <Text style={styles.riderInitial}>{selectedRider.name.charAt(0)}</Text>
            </View>
            <View style={styles.riderHeaderInfo}>
              <Text style={[styles.riderName, { color: text }]}>{selectedRider.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: selectedRider.status === "available" ? "#000000" : "#000000" }]} />
                <Text style={[styles.riderStatus, { color: selectedRider.status === "available" ? "#000000" : "#000000" }]}>
                  {selectedRider.status === "available" ? "Available Now" : "On Delivery"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeBottomSheet} style={styles.closeButton}>
              <ChevronDown size={24} color={subtitleText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[styles.quickStats, { borderTopColor: borderColor }]}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: text }]}>{selectedRider.deliveries}</Text>
            <Text style={[styles.statLabel, { color: subtitleText }]}>Total Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.ratingRow}>
              <Star size={18} color="#000000" fill="#000000" />
              <Text style={[styles.statValue, { color: text, marginLeft: 4 }]}>{selectedRider.rating}</Text>
            </View>
            <Text style={[styles.statLabel, { color: subtitleText }]}>Customer Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: text }]}>~{Math.floor(Math.random() * 10 + 15)} min</Text>
            <Text style={[styles.statLabel, { color: subtitleText }]}>ETA to You</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={[styles.sectionTitle, { color: text }]}>About</Text>
          <Text style={[styles.bioText, { color: subtitleText }]}>{selectedRider.bio}</Text>
        </View>

        {/* Disabled Contact Buttons with message */}
        <View style={[styles.noOrderNotice, { backgroundColor: isDark ? '#404040' : '#F5F5F5' }]}>
          <Text style={[styles.noOrderNoticeText, { color: isDark ? '#D4D4D4' : '#262626' }]}>
            Place an order to contact this rider
          </Text>
        </View>

        {/* Call/Message Buttons - Disabled */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.disabledButton]}
            onPress={handleContactDisabled}
          >
            <Phone size={20} color="#A3A3A3" />
            <Text style={styles.disabledButtonText}>Call Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.disabledButton]}
            onPress={handleContactDisabled}
          >
            <MessageCircle size={20} color="#A3A3A3" />
            <Text style={styles.disabledButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={mapInteractionEnabled}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: cardBg }]}>
            <ArrowLeft size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: text }]}>
            {activeOrderWithRider ? "Track Your Rider" : "Live Rider Tracking"}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Stats Bar - Only show when no active order */}
        {!activeOrderWithRider && (
          <View style={[styles.statsBar, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.statItem}>
              <Bike size={20} color="#000000" />
              <Text style={[styles.statText, { color: text }]}>{availableRiders} Available</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            <View style={styles.statItem}>
              <Clock size={20} color="#000000" />
              <Text style={[styles.statText, { color: text }]}>~25 min avg</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            <View style={styles.statItem}>
              <Bike size={20} color="#000000" />
              <Text style={[styles.statText, { color: text }]}>{busyRiders} Busy</Text>
            </View>
          </View>
        )}

        {/* Active Order Banner */}
        {activeOrderWithRider && (
          <View style={[styles.activeOrderBanner, { backgroundColor: '#00000020', borderColor: '#000000' }]}>
            <View style={styles.liveDotSmall} />
            <Text style={[styles.activeOrderText, { color: '#000000' }]}>
              Live tracking your delivery
            </Text>
          </View>
        )}

        {/* Map */}
        <View style={styles.mapHeroContainer}>
          <View style={styles.mapWrapper}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={DELIVERY_AREA_CENTER}
              customMapStyle={mapStyle}
              showsUserLocation
              showsMyLocationButton={false}
              showsCompass={false}
              scrollEnabled={mapInteractionEnabled}
              zoomEnabled={mapInteractionEnabled}
              rotateEnabled={mapInteractionEnabled}
              pitchEnabled={mapInteractionEnabled}
            >
              {activeOrderWithRider ? (
                <>
                  {/* Only show assigned rider */}
                  <RiderMarker
                    rider={activeOrderWithRider.rider}
                    isSelected={true}
                    onPress={() => {}}
                    isAssignedRider={true}
                  />
                  {/* Delivery destination marker */}
                  <Marker
                    coordinate={{
                      latitude: parseFloat(String(activeOrderWithRider.order.delivery_latitude || activeOrderWithRider.order.delivery_lat)) || DELIVERY_AREA_CENTER.latitude,
                      longitude: parseFloat(String(activeOrderWithRider.order.delivery_longitude || activeOrderWithRider.order.delivery_lng)) || DELIVERY_AREA_CENTER.longitude,
                    }}
                    title="Delivery Address"
                    description={activeOrderWithRider.order.delivery_address}
                    pinColor="red"
                  />
                </>
              ) : (
                // Show all riders when no active order
                riders.map(rider => (
                  <RiderMarker
                    key={rider.id}
                    rider={rider}
                    isSelected={selectedRider?.id === rider.id}
                    onPress={() => handleRiderPress(rider)}
                  />
                ))
              )}
            </MapView>

            {/* Area Label */}
            <View style={[styles.areaLabel, { backgroundColor: cardBg, borderColor }]}>
              <Navigation size={16} color="#000000" />
              <Text style={[styles.areaText, { color: text }]}>MacNose Delivery Area</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={(selectedRider || activeOrderWithRider) ? "auto" : "none"}
      >
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={closeBottomSheet} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[styles.bottomSheet, { backgroundColor: cardBg, transform: [{ translateY: sheetPosition }] }]}
      >
        {/* Handle */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={[styles.handle, { backgroundColor: borderColor }]} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.sheetScrollView}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled
          bounces={true}
        >
          {activeOrderWithRider ? renderAssignedRiderCard() : renderGenericRiderCard()}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, bottom: 35 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  statsBar: { flexDirection: "row", marginHorizontal: 20, marginBottom: 20, borderRadius: 16, padding: 16, borderWidth: 1 },
  statItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  statText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  divider: { width: 1, height: "100%", marginHorizontal: 8 },
  activeOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  activeOrderText: { fontSize: 14, fontWeight: '600' },
  liveDotSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#000000', marginRight: 8 },
  mapHeroContainer: { flex: 1, marginHorizontal: 20, marginBottom: 24, borderRadius: 24, overflow: "hidden" },
  mapWrapper: { position: "relative" },
  map: { width: "100%", height: height * 0.55, borderRadius: 24 },
  areaLabel: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  areaText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  markerContainer: { alignItems: "center", justifyContent: "center" },
  markerDot: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#FFFFFF" },
  assignedMarkerDot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  motorcycleEmoji: { fontSize: 24 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  backdropTouch: { flex: 1 },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  handleContainer: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  sheetScrollView: { flex: 1 },
  sheetContent: { paddingBottom: 100, flexGrow: 1 },
  sheetHeader: { paddingHorizontal: 20, paddingBottom: 20 },

  // Assigned Rider Styles (DriverFoundScreen style)
  driverFoundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverFoundText: { fontSize: 20, fontWeight: 'bold' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  ratingBadgeText: { fontSize: 14, fontWeight: '600', color: '#262626', marginLeft: 4 },
  assignedRiderInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  riderAvatarLarge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  riderInitialLarge: { color: '#FFFFFF', fontWeight: '700', fontSize: 28 },
  riderDetails: { marginLeft: 16, flex: 1 },
  riderNameLarge: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  vehicleInfo: { fontSize: 16 },
  orderInfoCard: { marginHorizontal: 20, padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  orderLabel: { fontSize: 14, marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  deliveryAddressText: { fontSize: 16, marginLeft: 8, flex: 1, lineHeight: 22 },
  liveTrackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000000', marginRight: 8 },
  liveTrackingText: { color: '#000000', fontSize: 14, fontWeight: '600' },
  actionButtonsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  actionButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4
  },
  secondaryButtonLarge: { backgroundColor: 'transparent', borderWidth: 1.5 },
  actionButtonTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  actionButtonTextColored: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  deliveryCodeCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryCodeLabel: { fontSize: 14, marginBottom: 4 },
  deliveryCodeValue: { fontSize: 28, fontWeight: 'bold', letterSpacing: 2 },

  // Generic Rider Styles
  riderHeaderRow: { flexDirection: "row", alignItems: "center" },
  riderAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  riderInitial: { color: "#FFFFFF", fontWeight: "700", fontSize: 24 },
  riderHeaderInfo: { flex: 1, marginLeft: 14 },
  riderName: { fontWeight: "700", fontSize: 18, marginBottom: 6 },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  riderStatus: { fontWeight: "600", fontSize: 14 },
  closeButton: { padding: 4 },
  quickStats: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, paddingTop: 16, marginHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  bioSection: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
  bioText: { fontSize: 13, lineHeight: 18 },
  noOrderNotice: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  noOrderNoticeText: { fontSize: 14, fontWeight: '500' },
  actionButtons: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 8 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", flex: 1, paddingVertical: 12, borderRadius: 12, marginHorizontal: 4 },
  disabledButton: { backgroundColor: '#E5E5E5' },
  disabledButtonText: { color: '#A3A3A3', marginLeft: 8, fontWeight: '600' },
});
