import { ArrowLeft, CheckCircle, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PaymentProps {
  onBack?: () => void;
  onPaymentSuccess?: (paymentData: PaymentData) => void;
  bookingData: BookingData;
}

interface BookingData {
  bookingType: "delivery" | "sitin" | "takeaway";
  deliveryAddress?: string;
  sitInTime?: string;
  partySize?: number;
  location?: string;
  specialRequests?: string;
  totalPrice: number;
  userEmail?: string;
  userName?: string;
}

interface PaymentData {
  paymentId: string;
  amount: number;
  paymentMethod: "paystack" | "card";
  status: "pending" | "completed" | "failed";
  bookingData: BookingData;
  timestamp: string;
}

export const PaymentScreen: React.FC<PaymentProps> = ({
  onBack,
  onPaymentSuccess,
  bookingData,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "card">("paystack");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const borderColor = isDark ? "#333333" : "#e0e0e0";
  const accentColor = "#F59E0B";

  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    if (showSuccess) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showSuccess]);

  const handlePaymentSubmit = async () => {
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
        alert("Please fill in all card details");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 16) {
        alert("Invalid card number");
        return;
      }
    }

    setProcessing(true);

    // Simulate payment processing with Paystack
    setTimeout(() => {
      const newPaymentId = `PAY-${Date.now()}`;
      setPaymentId(newPaymentId);
      setProcessing(false);
      setShowSuccess(true);

      // Show success for 3 seconds then proceed to driver tracking
      setTimeout(() => {
        const paymentData: PaymentData = {
          paymentId: newPaymentId,
          amount: bookingData.totalPrice,
          paymentMethod,
          status: "completed",
          bookingData,
          timestamp: new Date().toISOString(),
        };
        onPaymentSuccess?.(paymentData);
      }, 2500);
    }, 2000);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned
      .slice(0, 16)
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    setCardNumber(formatted);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  if (showSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successContainer}
        >
          <Animated.View
            style={[
              styles.checkCircle,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <CheckCircle size={80} color="#ffffff" strokeWidth={1.5} />
          </Animated.View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>Your order has been confirmed</Text>
          <View style={styles.paymentInfoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment ID:</Text>
              <Text style={styles.infoValue}>{paymentId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount:</Text>
              <Text style={styles.infoValue}>R{bookingData.totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>
                {bookingData.bookingType.charAt(0).toUpperCase() + bookingData.bookingType.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.processingText}>Initializing your order...</Text>
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
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={[styles.section, { borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: textColor }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              R{(bookingData.totalPrice * 0.9).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: textColor }]}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>
              {bookingData.bookingType === "delivery" ? `R${(bookingData.totalPrice * 0.1).toFixed(2)}` : "Free"}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { borderColor }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: textColor }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: accentColor, fontSize: 20 }]}>
              R{bookingData.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={[styles.section, { borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Payment Method</Text>

          {/* Paystack Option */}
          <TouchableOpacity
            style={[
              styles.methodOption,
              {
                backgroundColor: paymentMethod === "paystack" ? accentColor : isDark ? "#222" : "#f5f5f5",
                borderColor: accentColor,
              },
            ]}
            onPress={() => setPaymentMethod("paystack")}
          >
            <View style={styles.methodContent}>
              <Zap
                size={24}
                color={paymentMethod === "paystack" ? "#ffffff" : accentColor}
              />
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={[
                    styles.methodTitle,
                    { color: paymentMethod === "paystack" ? "#ffffff" : textColor },
                  ]}
                >
                  Paystack
                </Text>
                <Text
                  style={[
                    styles.methodDesc,
                    { color: paymentMethod === "paystack" ? "rgba(255,255,255,0.8)" : "#888" },
                  ]}
                >
                  Fast & Secure
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                {
                  backgroundColor: paymentMethod === "paystack" ? "#ffffff" : "transparent",
                  borderColor: paymentMethod === "paystack" ? "#ffffff" : borderColor,
                },
              ]}
            >
              {paymentMethod === "paystack" && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: accentColor,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Card Option */}
          <TouchableOpacity
            style={[
              styles.methodOption,
              {
                backgroundColor: paymentMethod === "card" ? accentColor : isDark ? "#222" : "#f5f5f5",
                borderColor: accentColor,
                marginTop: 10,
              },
            ]}
            onPress={() => setPaymentMethod("card")}
          >
            <View style={styles.methodContent}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  backgroundColor: paymentMethod === "card" ? "#ffffff" : accentColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "bold", color: accentColor }}>💳</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={[
                    styles.methodTitle,
                    { color: paymentMethod === "card" ? "#ffffff" : textColor },
                  ]}
                >
                  Credit/Debit Card
                </Text>
                <Text
                  style={[
                    styles.methodDesc,
                    { color: paymentMethod === "card" ? "rgba(255,255,255,0.8)" : "#888" },
                  ]}
                >
                  Visa, Mastercard
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                {
                  backgroundColor: paymentMethod === "card" ? "#ffffff" : "transparent",
                  borderColor: paymentMethod === "card" ? "#ffffff" : borderColor,
                },
              ]}
            >
              {paymentMethod === "card" && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: accentColor,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        {paymentMethod === "card" && (
          <View style={[styles.section, { borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Card Details</Text>

            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Full Name"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={cardName}
              onChangeText={setCardName}
            />

            <TextInput
              style={[styles.input, { color: textColor, borderColor, marginTop: 10 }]}
              placeholder="Card Number"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={cardNumber}
              onChangeText={formatCardNumber}
              keyboardType="number-pad"
              maxLength={19}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor, flex: 1 }]}
                placeholder="MM/YY"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={cardExpiry}
                onChangeText={formatExpiry}
                keyboardType="number-pad"
                maxLength={5}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor, flex: 1 }]}
                placeholder="CVV"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={cardCVV}
                onChangeText={(text) => setCardCVV(text.replace(/\D/g, "").slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        )}

        {/* Paystack Info */}
        {paymentMethod === "paystack" && (
          <View style={[styles.section, { borderColor, backgroundColor: isDark ? "#222" : "#f0fdf4" }]}>
            <Text style={[styles.infoTitle, { color: "#10B981" }]}>🔒 Paystack Integration</Text>
            <Text style={[styles.infoText, { color: textColor, marginTop: 8 }]}>
              Your payment will be processed securely through Paystack. No card details are stored on our servers.
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.footer, { borderTopColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.payButton,
            {
              backgroundColor: accentColor,
              opacity: processing ? 0.7 : 1,
            },
          ]}
          onPress={handlePaymentSubmit}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>Pay R{bookingData.totalPrice.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  totalValue: {
    fontWeight: "bold",
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "space-between",
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  methodDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  payButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  checkCircle: {
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
  paymentInfoBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  infoValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  processingText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 8,
  },
});
