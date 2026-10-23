// ============================================
// EditProfileScreen.tsx (INTEGRATED)
// ============================================

import { ArrowLeft, Save } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { useAuth } from "@/src/auth/AuthContext";
import usersApiService from "@/src/services/users";

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen = ({ onBack }: EditProfileScreenProps) => {
  const { userProfile } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Form state
  const [name, setName] = useState(userProfile?.display_name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [loading, setLoading] = useState(!userProfile);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Colors
  const bg = isDark ? "#05070A" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111827";
  const subtitleText = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#1F2937" : "#F9FAFB";
  const inputBg = isDark ? "#0F172A" : "#F3F4F6";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const accentColor = isDark ? "#4F46E5" : "#2563EB";

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      console.log('EditProfileScreen: Loading profile data:', userProfile.display_name);
      setName(userProfile.display_name || "");
      setPhone(userProfile.phone || "");
      setLoading(false);
    }
  }, [userProfile]);

  // Track if there are changes
  useEffect(() => {
    const hasNameChange = name !== (userProfile?.display_name || "");
    const hasPhoneChange = phone !== (userProfile?.phone || "");
    setHasChanges(hasNameChange || hasPhoneChange);
  }, [name, phone, userProfile]);

  const getInitials = () => {
    const displayName = userProfile?.display_name || "";
    return displayName.charAt(0).toUpperCase() || "U";
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return false;
    }

    if (name.trim().length < 2) {
      Alert.alert("Validation Error", "Full name must be at least 2 characters");
      return false;
    }

    if (phone.trim() && !/^[\d\s\+\-\(\)]+$/.test(phone)) {
      Alert.alert("Validation Error", "Phone number contains invalid characters");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!hasChanges) {
      Alert.alert("Info", "No changes to save");
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdateUserData = {
        display_name: name.trim(),
      };
      if (phone.trim()) {
        updateData.phone = phone.trim();
      }
      const updatedProfile = await usersApiService.updateUserProfile(updateData);

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Profile is automatically updated in context
            onBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bg, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      style={[styles.container, { backgroundColor: bg }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "#374151" : "#E5E7EB" }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !hasChanges}
          style={[
            styles.saveButton,
            {
              opacity: saving || !hasChanges ? 0.5 : 1,
            },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={accentColor} />
          ) : (
            <Save size={24} color={accentColor} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={[styles.profilePicture, { backgroundColor: "#3B82F6" }]}>
            <Text style={[styles.profileText, { color: text }]}>{getInitials()}</Text>
          </View>
          <Text style={[styles.emailText, { color: subtitleText }]}>
            {userProfile?.email}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: text }]}>Full Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: hasChanges && name === (userProfile?.display_name || "") ? borderColor : accentColor,
                  color: text,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={subtitleText}
              editable={!saving}
            />
            <Text style={[styles.helperText, { color: subtitleText }]}>
              {name.length} characters
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: text }]}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={[styles.input, { backgroundColor: inputBg, borderColor, color: text }]}
              placeholder="Enter your phone number"
              placeholderTextColor={subtitleText}
              keyboardType="phone-pad"
              editable={!saving}
            />
            <Text style={[styles.helperText, { color: subtitleText }]}>
              Optional - include country code for international numbers
            </Text>
          </View>

          {/* Changed Fields Indicator */}
          {hasChanges && (
            <View style={[styles.changesAlert, { backgroundColor: accentColor + "20" }]}>
              <Text style={[styles.changesAlertText, { color: accentColor }]}>
                ✓ You have unsaved changes
              </Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !hasChanges}
            style={[
              styles.saveButtonLarge,
              {
                backgroundColor: hasChanges && !saving ? accentColor : isDark ? "#374151" : "#D1D5DB",
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {hasChanges ? "Save Changes" : "No Changes"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", flex: 1, textAlign: "center" },
  saveButton: { padding: 8 },
  content: { flex: 1, padding: 16 },
  profileSection: { alignItems: "center", marginBottom: 32 },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileText: { fontWeight: "700", fontSize: 32 },
  emailText: { fontSize: 14, marginBottom: 12 },
  formSection: { gap: 20, paddingBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  helperText: { fontSize: 12, marginTop: 6 },
  changesAlert: { padding: 12, borderRadius: 8, marginVertical: 12 },
  changesAlertText: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  saveButtonLarge: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
});