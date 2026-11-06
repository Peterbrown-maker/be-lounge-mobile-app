import { useAuth } from "@/src/auth/AuthContext";
import { ProfileAvatar } from "@/src/components/ProfileAvatar";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { R, T } from "@/src/theme";
import { Camera, Phone, User } from "lucide-react-native";
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
  View,
} from "react-native";

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen = ({ onBack }: EditProfileScreenProps) => {
  const { userProfile, updateUserProfile, changeProfilePhoto } = useAuth();
  const [name, setName] = useState(userProfile?.display_name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<"name" | "phone" | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.display_name || "");
      setPhone(userProfile.phone || "");
    }
  }, [userProfile?.id]);

  const hasChanges =
    name.trim() !== (userProfile?.display_name || "") || phone.trim() !== (userProfile?.phone || "");

  const nameError = name.trim().length > 0 && name.trim().length < 2 ? "At least 2 characters" : "";
  const phoneError = phone.trim() && !/^[\d\s+\-()]+$/.test(phone) ? "Only numbers, spaces, + - ( )" : "";
  const canSave = hasChanges && !saving && name.trim().length >= 2 && !phoneError;

  const handleChangePhoto = async () => {
    try {
      await changeProfilePhoto();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not update profile picture.");
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await updateUserProfile({ display_name: name.trim(), phone: phone.trim() });
      onBack();
    } catch (error: any) {
      Alert.alert("Couldn't save", error?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader title="Edit profile" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarBlock}>
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8} accessibilityLabel="Change profile picture">
            <ProfileAvatar size={96} />
            <View style={styles.cameraBadge}>
              <Camera size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChangePhoto}>
            <Text style={styles.changePhoto}>Change photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Full name</Text>
        <View style={[styles.inputWrap, focused === "name" && styles.inputFocused, !!nameError && styles.inputError]}>
          <User size={18} color={focused === "name" ? T.text : T.placeholder} />
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={T.placeholder}
            autoCapitalize="words"
            editable={!saving}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
          />
        </View>
        {!!nameError && <Text style={styles.error}>{nameError}</Text>}

        <Text style={[styles.label, { marginTop: 18 }]}>Phone</Text>
        <View style={[styles.inputWrap, focused === "phone" && styles.inputFocused, !!phoneError && styles.inputError]}>
          <Phone size={18} color={focused === "phone" ? T.text : T.placeholder} />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="071 234 5678"
            placeholderTextColor={T.placeholder}
            keyboardType="phone-pad"
            editable={!saving}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
          />
        </View>
        <Text style={phoneError ? styles.error : styles.helper}>
          {phoneError || "So your driver can reach you when they're outside."}
        </Text>

        <Text style={[styles.label, { marginTop: 18 }]}>Email</Text>
        <View style={[styles.inputWrap, styles.inputDisabled]}>
          <Text style={[styles.input, { color: T.muted }]} numberOfLines={1}>{userProfile?.email}</Text>
        </View>
        <Text style={styles.helper}>Your sign-in email can't be changed here.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.save, !canSave && styles.saveDisabled]}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.saveText, !canSave && { color: T.muted }]}>
              {hasChanges ? "Save changes" : "No changes"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, paddingBottom: 24 },
  avatarBlock: { alignItems: "center", marginVertical: 16 },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.ember,
    borderWidth: 3,
    borderColor: T.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhoto: { color: T.emberText, fontWeight: "800", fontSize: 14, marginTop: 12 },
  label: { color: T.text, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: R.md,
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.surface,
  },
  inputFocused: { borderColor: T.text, backgroundColor: T.bg },
  inputError: { borderColor: T.danger },
  inputDisabled: { backgroundColor: T.surfaceAlt, borderColor: T.border },
  input: { flex: 1, color: T.text, fontSize: 15, paddingVertical: 0, alignSelf: "stretch" },
  helper: { color: T.muted, fontSize: 12, marginTop: 6 },
  error: { color: T.danger, fontSize: 12, marginTop: 6 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.bg },
  save: { height: 54, borderRadius: R.lg, backgroundColor: T.text, alignItems: "center", justifyContent: "center" },
  saveDisabled: { backgroundColor: T.surface },
  saveText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
