import { MapPin, Navigation, Phone, Star } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface DriverTrackingProps {
  paymentData: PaymentData;
  onOrderComplete?: (orderData: OrderCompletionData) => void;
  onCancel?: () => void;
}

interface PaymentData {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  bookingData: any;
  timestamp: string;
}

interface OrderCompletionData {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  completedAt: string;
}

type TrackingStep = "finding" | "found" | "tracking" | "arrived" | "complete";

interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  eta: number; // in minutes
}

export const DriverTrackingScreen: React.FC<DriverTrackingProps> = ({
  paymentData,
  onOrderComplete,
  onCancel,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState<TrackingStep>("finding");
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [driverLocation, setDriverLocation] = useState({ latitude: 0, longitude: 0 });
  const [orderCode, setOrderCode] = useState("");
  const [eta, setEta] = useState(15);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([
    { id: 1, status: "Order Confirmed", time: "Just now", completed: true },
    { id: 2, status: "Preparing Your Order", time: "2 mins", completed: false },
    { id: 3, status: "Order Ready", time: "8 mins", completed: false },
    { id: 4, status: "Driver Assigned", time: "12 mins", completed: false },
    { id: 5, status: "On the Way", time: "15 mins", completed: false },
    { id: 6, status: "Arriving Soon", time: "18 mins", completed: false },
  ]);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const accentColor = "#F59E0B";
  const successColor = "#10B981";

  // Simulate finding driver
  useEffect(() => {
    const findDriverTimer = setTimeout(() => {
      const mockDriver: DriverInfo = {
        id: `DRV-${Math.random().toString(36).substr(2, 9)}`,
        name: "Sipho Mthembu",
        phone: "+27 81 123 4567",
        vehicle: "Toyota Avanza - GP69 YTE",
        rating: 4.9,
        currentLocation: {
          latitude: -25.7456,
          longitude: 28.2305,
          accuracy: 10,
        },
        eta: 12,
      };
      setDriverInfo(mockDriver);
      setStep("found");

      // Update order statuses
      updateOrderStatus(3, true);
      updateOrderStatus(4, true);

      // Simulate driver movement to location
      setTimeout(() => {
        setStep("tracking");
        updateOrderStatus(5, true);
      }, 4000);
    }, 3000);

    return () => clearTimeout(findDriverTimer);
  }, []);

  // Simulate driver arrival
  useEffect(() => {
    if (step === "tracking") {
      const arrivalTimer = setTimeout(() => {
        setStep("arrived");
        updateOrderStatus(6, true);
        const code = generateOrderCode();
        setOrderCode(code);

        // Auto complete after showing order code
        setTimeout(() => {
          setStep("complete");
        }, 4000);
      }, 8000);

      return () => clearTimeout(arrivalTimer);
    }
  }, [step]);

  // Pulse animation for finding driver
  useEffect(() => {
    if (step === "finding") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [step]);

  // Rotation animation for driver icon
  useEffect(() => {
    if (step === "tracking") {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [step]);

  const updateOrderStatus = (statusId: number, completed: boolean) => {
    setOrderStatuses((prevStatuses) =>
      prevStatuses.map((status) =>
        status.id === statusId ? { ...status, completed } : status
      )
    );
  };

  const generateOrderCode = () => {
    return `FH${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const rotateValue = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (step === "finding") {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <LinearGradient
          colors={[accentColor, "#FB923C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.findingContainer}
        >
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseScale }],
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
              },
            ]}
          />
          <View style={styles.driverIconContainer}>
            <Text style={{ fontSize: 60 }}>🚗</Text>
          </View>
          <Text style={styles.findingTitle}>Finding Driver...</Text>
          <Text style={styles.findingSubtitle}>
            Looking for available drivers near you
          </Text>
          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={{ marginTop: 20 }}
          />
        </LinearGradient>
      </View>
    );
  }

  if (step === "complete") {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <LinearGradient
          colors={[successColor, "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successContainer}
        >
          <View style={styles.checkmark}>
            <Text style={{ fontSize: 80 }}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order Complete!</Text>
          <Text style={styles.successSubtitle}>Thank you for your order</Text>

          <View style={styles.finalSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Code:</Text>
              <Text style={styles.summaryCode}>{orderCode}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>R{paymentData.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Type:</Text>
              <Text style={styles.summaryValue}>
                {paymentData.bookingData.bookingType.charAt(0).toUpperCase() +
                  paymentData.bookingData.bookingType.slice(1)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              const orderData: OrderCompletionData = {
                orderId: paymentData.paymentId,
                orderCode,
                totalAmount: paymentData.amount,
                completedAt: new Date().toISOString(),
              };
              onOrderComplete?.(orderData);
            }}
          >
            <Text style={styles.completeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <LinearGradient
        colors={[accentColor, "#FB923C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {step === "found" && "Driver Found!"}
          {step === "tracking" && "Driver on the Way"}
          {step === "arrived" && "Driver Arrived"}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Driver Info Card */}
        {driverInfo && (
          <View style={[styles.driverCard, { borderColor: accentColor }]}>
            <View style={styles.driverHeader}>
              <View style={styles.driverAvatar}>
                <Text style={{ fontSize: 40 }}>👨‍💼</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.driverName, { color: textColor }]}>
                  {driverInfo.name}
                </Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#FFB800" fill="#FFB800" />
                  <Text style={[styles.ratingText, { color: textColor }]}>
                    {driverInfo.rating} ({Math.floor(Math.random() * 100) + 50} trips)
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={[styles.vehicleInfo, { borderTopColor: accentColor }]}>
              <Text style={[styles.vehicleLabel, { color: "#888" }]}>Vehicle:</Text>
              <Text style={[styles.vehicleValue, { color: textColor }]}>
                {driverInfo.vehicle}
              </Text>
            </View>

            {/* ETA Display */}
            <View style={[styles.etaContainer, { backgroundColor: accentColor }]}>
              <Navigation size={20} color="#ffffff" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.etaLabel}>Estimated Arrival</Text>
                <Text style={styles.etaTime}>{driverInfo.eta} minutes</Text>
              </View>
            </View>
          </View>
        )}

        {/* Map Simulation */}
        {step === "tracking" && (
          <View style={[styles.mapContainer, { borderColor: accentColor }]}>
            <View style={styles.mapPlaceholder}>
              <Text style={[styles.mapText, { color: textColor }]}>
                📍 Real-time Map View
              </Text>
              <View style={styles.locationAnimation}>
                <Animated.View
                  style={[
                    styles.driverMarker,
                    { transform: [{ rotate: rotateValue }] },
                  ]}
                >
                  <Text style={{ fontSize: 32 }}>🚗</Text>
                </Animated.View>
              </View>
              <View style={styles.locationPin}>
                <Text style={{ fontSize: 32 }}>📍</Text>
              </View>
              <Text style={[styles.mapLabel, { color: "#888" }]}>
                Your location
              </Text>
            </View>
          </View>
        )}

        {/* Order Code Display (Arrived) */}
        {step === "arrived" && orderCode && (
          <View style={[styles.orderCodeCard, { backgroundColor: successColor }]}>
            <Text style={styles.orderCodeLabel}>Your Order Code</Text>
            <Text style={styles.orderCodeValue}>{orderCode}</Text>
            <Text style={styles.orderCodeHint}>
              Show this code when collecting your order
            </Text>
          </View>
        )}

        {/* Order Status Timeline */}
        <View style={[styles.timelineContainer, { borderColor: accentColor }]}>
          <Text style={[styles.timelineTitle, { color: textColor }]}>
            Order Status
          </Text>
          {orderStatuses.map((status, index) => (
            <View key={status.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: status.completed ? successColor : "#ccc",
                    },
                  ]}
                >
                  {status.completed && (
                    <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>
                  )}
                </View>
                {index < orderStatuses.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: status.completed
                          ? successColor
                          : "#e0e0e0",
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineStatus,
                    {
                      color: textColor,
                      fontWeight: status.completed ? "600" : "500",
                    },
                  ]}
                >
                  {status.status}
                </Text>
                <Text style={[styles.timelineTime, { color: "#888" }]}>
                  {status.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Cancel Button */}
      <View style={[styles.footer, { borderTopColor: accentColor }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface OrderStatus {
  id: number;
  status: string;
  time: string;
  completed: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  findingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  pulseCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  driverIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    zIndex: 1,
  },
  findingTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 16,
  },
  findingSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  checkmark: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 24,
  },
  finalSummary: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  summaryCode: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  completeButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "bold",
  },
  driverCard: {
    backgroundColor: "rgba(245, 158, 11, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  vehicleLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  vehicleValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  etaLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
  },
  etaTime: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  mapContainer: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    marginBottom: 16,
    height: 200,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  mapText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  locationAnimation: {
    position: "absolute",
    left: 30,
    top: 80,
  },
  driverMarker: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  locationPin: {
    position: "absolute",
    right: 30,
    bottom: 30,
  },
  mapLabel: {
    fontSize: 11,
    marginTop: 8,
  },
  orderCodeCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  orderCodeLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  orderCodeValue: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 2,
    marginVertical: 8,
    marginTop: 12,
  },
  orderCodeHint: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 8,
  },
  timelineContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 12,
    width: 30,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    height: 50,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineStatus: {
    fontSize: 13,
  },
  timelineTime: {
    fontSize: 11,
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "600",
  },
});
