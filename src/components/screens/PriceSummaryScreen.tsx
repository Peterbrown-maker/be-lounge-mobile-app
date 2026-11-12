import { ArrowLeft, Clock, CreditCard, MapPin } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/ui/button";

interface PriceSummaryScreenProps {
  onBack: () => void;
  onConfirm: (paymentMethod: "cash" | "paynow") => void;
}

export const PriceSummaryScreen = ({ onBack, onConfirm }: PriceSummaryScreenProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "paynow">("cash");

  // Mock data
  const deliveryDetails = {
    service: "Pick Up & Drop Off",
    pickup: "43 Aubrey Matlakala St, Soshanguve",
    dropoff: "456 Block BB, Soshanguve",
    distance: "2.5 km",
    estimatedTime: "15-20 min",
    baseFare: 25,
    distanceFee: 10,
    total: 35,
  };

  return (
    <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed
    style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Price Summary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{deliveryDetails.service}</Text>

          <View style={styles.infoRow}>
            <MapPin size={20} color="#000000" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Pickup</Text>
              <Text style={styles.infoValue}>{deliveryDetails.pickup}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color="#000000" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Dropoff</Text>
              <Text style={styles.infoValue}>{deliveryDetails.dropoff}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Clock size={20} color="#737373" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Estimated Time</Text>
              <Text style={styles.infoValue}>{deliveryDetails.estimatedTime}</Text>
            </View>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fare Breakdown</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base fare</Text>
            <Text style={styles.summaryValue}>R{deliveryDetails.baseFare}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Distance ({deliveryDetails.distance})</Text>
            <Text style={styles.summaryValue}>R{deliveryDetails.distanceFee}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R{deliveryDetails.total}</Text>
          </View>
        </View>

        {/* Payment Options */}
        <View style={styles.paymentContainer}>
          {/* Cash on Delivery */}
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === "cash" && styles.paymentCardSelected,
            ]}
            onPress={() => setPaymentMethod("cash")}
            activeOpacity={0.8}
          >
            <CreditCard size={24} color={paymentMethod === "cash" ? "#FFFFFF" : "#000000"} />
            <View style={styles.paymentTextContainer}>
              <Text
                style={[
                  styles.paymentTitle,
                  paymentMethod === "cash" && { color: "#FFFFFF" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Cash on Delivery
              </Text>
              <Text
                style={[
                  styles.paymentSubtitle,
                  paymentMethod === "cash" && { color: "#E5E5E5" },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Pay when your item arrives at your doorstep
              </Text>
            </View>
          </TouchableOpacity>

          {/* Pay Now */}
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === "paynow" && styles.paymentCardSelected,
            ]}
            onPress={() => setPaymentMethod("paynow")}
            activeOpacity={0.8}
          >
            <CreditCard size={24} color={paymentMethod === "paynow" ? "#FFFFFF" : "#000000"} />
            <View style={styles.paymentTextContainer}>
              <Text
                style={[
                  styles.paymentTitle,
                  paymentMethod === "paynow" && { color: "#FFFFFF" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Pay Now
              </Text>
              <Text
                style={[
                  styles.paymentSubtitle,
                  paymentMethod === "paynow" && { color: "#E5E5E5" },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Secure online payment using card, UPI, or mobile wallet
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <Button onPress={() => onConfirm(paymentMethod)}>Confirm & Book Rider</Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111111" },
  scrollContent: { padding: 16, paddingBottom: 24, gap: 16 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#111111" },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 12, color: "#737373" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111111" },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: "#737373" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#111111" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#111111" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#000000" },

  paymentContainer: { flexDirection: "row", gap: 12 },
  paymentCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#E5E5E5",
    minHeight: 80,
  },
  paymentCardSelected: { backgroundColor: "#000000" },
  paymentTextContainer: { flex: 1, marginLeft: 12 },
  paymentTitle: { fontSize: 16, fontWeight: "600", color: "#000000" },
  paymentSubtitle: { fontSize: 14, color: "#00000099", flexWrap: "wrap", marginTop: 4 },

  buttonContainer: { padding: 16 },
});
