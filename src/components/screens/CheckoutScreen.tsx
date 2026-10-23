import { useAuth } from "@/src/auth/AuthContext";
import { ArrowLeft, Calendar, Clock, Home, MapPin, Users, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CheckoutProps {
  onBack?: () => void;
  onPayment?: (bookingData: BookingData) => void;
  cartItems?: CartItem[];
  totalPrice?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface BookingData {
  bookingType: "delivery" | "sitin" | "takeaway";
  deliveryAddress?: string;
  sitInTime?: string;
  partySize?: number;
  location?: "inside" | "patio" | "private";
  specialRequests?: string;
  totalPrice: number;
  userEmail?: string;
  userName?: string;
}

export const CheckoutScreen: React.FC<CheckoutProps> = ({
  onBack,
  onPayment,
  cartItems = [],
  totalPrice = 0,
}) => {
  const { user, userProfile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [bookingType, setBookingType] = useState<"delivery" | "sitin" | "takeaway">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [sitInTime, setSitInTime] = useState("18:00");
  const [partySize, setPartySize] = useState("2");
  const [location, setLocation] = useState<"inside" | "patio" | "private">("inside");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);

  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const borderColor = isDark ? "#333333" : "#e0e0e0";
  const accentColor = "#F59E0B";

  const timeOptions = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  const partySizeOptions = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "10+"];
  const locationOptions = [
    { label: "Inside", value: "inside" as const },
    { label: "Patio", value: "patio" as const },
    { label: "Private Room", value: "private" as const },
  ];

  const handlePayment = () => {
    if (bookingType === "delivery" && !deliveryAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }

    setLoading(true);
    const bookingData: BookingData = {
      bookingType,
      deliveryAddress: bookingType === "delivery" ? deliveryAddress : undefined,
      sitInTime: bookingType === "sitin" ? sitInTime : undefined,
      partySize: bookingType === "sitin" ? parseInt(partySize) : undefined,
      location: bookingType === "sitin" ? location : undefined,
      specialRequests,
      totalPrice,
      userEmail: user?.email || userProfile?.email || "",
      userName: user?.displayName || userProfile?.display_name || "Guest",
    };

    setTimeout(() => {
      setLoading(false);
      onPayment?.(bookingData);
    }, 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <LinearGradient
        colors={[accentColor, "#FB923C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={[styles.section, { backgroundColor: isDark ? "#222" : "#f5f5f5", borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Your Details</Text>
          <View style={styles.userInfoRow}>
            <Text style={[styles.label, { color: textColor }]}>Email:</Text>
            <Text style={[styles.userValue, { color: accentColor }]}>
              {user?.email || userProfile?.email || "Not signed in"}
            </Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={[styles.label, { color: textColor }]}>Name:</Text>
            <Text style={[styles.userValue, { color: accentColor }]}>
              {user?.displayName || userProfile?.display_name || "Guest"}
            </Text>
          </View>
        </View>

        {/* Booking Type Selection */}
        <View style={[styles.section, { borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Booking Type</Text>
          <View style={styles.bookingTypeContainer}>
            <BookingTypeButton
              icon={<Zap size={24} color={bookingType === "delivery" ? "#fff" : textColor} />}
              label="Delivery"
              isSelected={bookingType === "delivery"}
              onPress={() => setBookingType("delivery")}
              accentColor={accentColor}
            />
            <BookingTypeButton
              icon={<Home size={24} color={bookingType === "sitin" ? "#fff" : textColor} />}
              label="Sit-in"
              isSelected={bookingType === "sitin"}
              onPress={() => setBookingType("sitin")}
              accentColor={accentColor}
            />
            <BookingTypeButton
              icon={<MapPin size={24} color={bookingType === "takeaway" ? "#fff" : textColor} />}
              label="Take-away"
              isSelected={bookingType === "takeaway"}
              onPress={() => setBookingType("takeaway")}
              accentColor={accentColor}
            />
          </View>
        </View>

        {/* Delivery Address */}
        {bookingType === "delivery" && (
          <View style={[styles.section, { borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Delivery Address</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Enter your delivery address"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Sit-in Booking Details */}
        {bookingType === "sitin" && (
          <View style={[styles.section, { borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Booking Details</Text>

            {/* Time Selection */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Clock size={18} color={accentColor} />
                <Text style={[styles.fieldLabel, { color: textColor, marginLeft: 8 }]}>Preferred Time</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeScroll}
                contentContainerStyle={{ paddingHorizontal: 8 }}
              >
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      {
                        backgroundColor: sitInTime === time ? accentColor : isDark ? "#333" : "#e0e0e0",
                      },
                    ]}
                    onPress={() => setSitInTime(time)}
                  >
                    <Text
                      style={[styles.timeButtonText, { color: sitInTime === time ? "#fff" : textColor }]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Party Size Selection */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Users size={18} color={accentColor} />
                <Text style={[styles.fieldLabel, { color: textColor, marginLeft: 8 }]}>Number of Guests</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sizeScroll}
                contentContainerStyle={{ paddingHorizontal: 8 }}
              >
                {partySizeOptions.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      {
                        backgroundColor: partySize === size ? accentColor : isDark ? "#333" : "#e0e0e0",
                      },
                    ]}
                    onPress={() => setPartySize(size)}
                  >
                    <Text
                      style={[styles.sizeButtonText, { color: partySize === size ? "#fff" : textColor }]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Location Selection */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <MapPin size={18} color={accentColor} />
                <Text style={[styles.fieldLabel, { color: textColor, marginLeft: 8 }]}>Seating Location</Text>
              </View>
              <View style={styles.locationGrid}>
                {locationOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.locationOption,
                      {
                        backgroundColor: location === opt.value ? accentColor : isDark ? "#333" : "#e0e0e0",
                        borderColor,
                      },
                    ]}
                    onPress={() => setLocation(opt.value)}
                  >
                    <Text
                      style={[styles.locationText, { color: location === opt.value ? "#fff" : textColor }]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Special Requests */}
        <View style={[styles.section, { borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Special Requests (Optional)</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Any special requests or allergies?"
            placeholderTextColor={isDark ? "#888" : "#999"}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Order Summary</Text>
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.summaryRow}>
                  <Text style={[styles.summaryItemName, { color: textColor }]}>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text style={[styles.summaryItemPrice, { color: accentColor }]}>
                    R{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              <View style={[styles.divider, { borderColor }]} />
            </>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: textColor }]}>Total Amount</Text>
            <Text style={[styles.totalPrice, { color: accentColor }]}>R{totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.footer, { borderTopColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            { backgroundColor: accentColor, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BookingTypeButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  accentColor: string;
}> = ({ icon, label, isSelected, onPress, accentColor }) => {
  return (
    <TouchableOpacity
      style={[
        styles.bookingTypeButton,
        {
          backgroundColor: isSelected ? accentColor : "transparent",
          borderColor: accentColor,
        },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text
        style={[
          styles.bookingTypeLabel,
          {
            color: isSelected ? "#ffffff" : accentColor,
            marginTop: 8,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  userValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  bookingTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  bookingTypeButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingTypeLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  timeScroll: {
    marginHorizontal: -8,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 70,
    alignItems: "center",
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sizeScroll: {
    marginHorizontal: -8,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 60,
    alignItems: "center",
  },
  sizeButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  locationGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  locationOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  divider: {
    height: 1,
    marginVertical: 12,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 13,
    fontWeight: "500",
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: "600",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  paymentButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
