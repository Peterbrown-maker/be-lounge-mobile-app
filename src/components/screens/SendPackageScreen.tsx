import { ArrowLeft, Camera, MapPin, Package, Phone, User } from "lucide-react-native";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface SendPackageScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

export const SendPackageScreen = ({ onBack, onContinue }: SendPackageScreenProps) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handlePhotoUpload = () => console.log("Photo upload pressed");

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
        <Text style={styles.headerTitle}>📦 Send Package</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Pickup Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup Location</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color="#22C55E" style={styles.icon} />
            <TextInput
              value={pickupLocation}
              onChangeText={setPickupLocation}
              placeholder="Where should we pick up the package?"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>
        </View>

        {/* Recipient Details */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient Details</Text>
          
          <View style={styles.inputWithIcon}>
            <User size={20} color="#6B7280" style={styles.icon} />
            <TextInput
              placeholder="Recipient name"
              placeholderTextColor="#9CA3AF"
              value={recipientName}
              onChangeText={setRecipientName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWithIcon}>
            <Phone size={20} color="#6B7280" style={styles.icon} />
            <TextInput
              placeholder="Recipient phone number"
              placeholderTextColor="#9CA3AF"
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWithIcon}>
            <MapPin size={20} color="#3B82F6" style={styles.icon} />
            <TextInput
              placeholder="Recipient address"
              placeholderTextColor="#9CA3AF"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              style={styles.input}
            />
          </View>
        </View>

        {/* Package Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Package Description</Text>
          <View style={styles.inputWithIcon}>
            <Package size={20} color="#6B7280" style={styles.iconTop} />
            <TextInput
              placeholder="Describe the package contents"
              placeholderTextColor="#9CA3AF"
              value={packageDescription}
              onChangeText={setPackageDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[styles.input, styles.textArea]}
            />
          </View>
        </View>

        {/* Photo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo of Package</Text>
          <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoUpload}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera size={32} color="#9CA3AF" />
                <Text style={styles.photoText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Special Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Special Instructions (Optional)</Text>
          <TextInput
            placeholder="Any special handling instructions?"
            placeholderTextColor="#9CA3AF"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity 
          onPress={onContinue} 
          style={styles.continueButton}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
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
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  formContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },

  // Input styling
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 12,
  },
  icon: { 
    position: "absolute", 
    left: 16, 
    zIndex: 1,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  iconTop: {
    position: "absolute", 
    left: 16, 
    top: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 48,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
    paddingLeft: 48,
  },

  photoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    aspectRatio: 16 / 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoPlaceholder: { 
    justifyContent: "center", 
    alignItems: "center", 
    gap: 8 
  },
  photoText: { fontSize: 13, color: "#9CA3AF", marginTop: 8 },
  photo: { width: "100%", height: "100%" },

  buttonWrapper: { 
    paddingHorizontal: 20, 
    paddingBottom: 24,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  continueButton: {
    backgroundColor: "#22C55E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: { 
    color: "#FFFFFF", 
    fontSize: 16, 
    fontWeight: "700" 
  },
});