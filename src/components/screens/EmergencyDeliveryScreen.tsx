import { AlertTriangle, ArrowLeft, MapPin, Zap } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface EmergencyDeliveryScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

export const EmergencyDeliveryScreen = ({ onBack, onContinue }: EmergencyDeliveryScreenProps) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [urgencyReason, setUrgencyReason] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed
    style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚡ Emergency Delivery</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Priority Info */}
        <View style={styles.priorityCard}>
          <Zap size={20} color="#FACC15" />
          <Text style={styles.priorityText}>
            Priority delivery — fastest available rider assigned immediately!
          </Text>
        </View>

        {/* Pickup Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup Location</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={20} color="#22C55E" style={styles.iconLeft} />
            <Input
              placeholder="Where to collect?"
              value={pickupLocation}
              onChangeText={setPickupLocation}
              style={styles.input}
            />
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Location</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={20} color="#3B82F6" style={styles.iconLeft} />
            <Input
              placeholder="Where to deliver urgently?"
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
              style={styles.input}
            />
          </View>
        </View>

        {/* Item Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What Needs Urgent Delivery?</Text>
          <Input
            placeholder="e.g. Medicine, documents, keys"
            value={itemDescription}
            onChangeText={setItemDescription}
            style={styles.input}
          />
        </View>

        {/* Urgency Reason */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Why Is It Urgent?</Text>
          <Input
            placeholder="Brief reason for urgency"
            value={urgencyReason}
            onChangeText={setUrgencyReason}
            style={styles.input}
          />
        </View>

        {/* Contact Person */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Person</Text>
          <Input
            placeholder="Name"
            value={contactName}
            onChangeText={setContactName}
            style={[styles.input, { marginBottom: 12 }]}
          />
          <Input
            placeholder="Phone number"
            value={contactPhone}
            onChangeText={setContactPhone}
            style={styles.input}
          />
        </View>

        {/* Emergency Fee Info */}
        <View style={styles.feeCard}>
          <AlertTriangle size={20} color="#EF4444" />
          <Text style={styles.feeText}>
            Emergency deliveries include a priority fee of +R15
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonWrapper}>
        <Button onPress={onContinue} style={styles.continueButton}>
          Request Emergency Rider →
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  priorityCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityText: {
    fontSize: 14,
    color: "#B45309",
    fontWeight: "600",
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconLeft: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingLeft: 36,
  },
  feeCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feeText: {
    fontSize: 14,
    color: "#B91C1C",
    fontWeight: "600",
    flex: 1,
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  continueButton: {
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
});
