import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface FetchFromHomeScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

export const FetchFromHomeScreen = ({ onBack, onContinue }: FetchFromHomeScreenProps) => {
  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed
    style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Fetch from Home</Text>
      </View>

      {/* Form */}
      <ScrollView
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/** Item Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Description</Text>
          <View style={styles.inputWrapper}>
            <Input
              placeholder="What item do you need?"
              value={itemDescription}
              onChangeText={setItemDescription}
              style={styles.input}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/** Quantity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.inputWrapper}>
            <Input
              placeholder="How many?"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/** Delivery Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Address</Text>
          <View style={styles.inputWrapper}>
            <Input
              placeholder="Where to deliver?"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              style={styles.input}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonWrapper}>
        <Button onPress={onContinue} style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continue →</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111111" },
  formContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "700", color: "#111111", marginBottom: 8 },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: { fontSize: 16, color: "#111111", minHeight: 40 },
  buttonWrapper: { paddingHorizontal: 20, paddingBottom: 24 },
  continueButton: {
    backgroundColor: "#000000",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
