import { useAuth } from "@/src/auth/AuthContext";
import { ProfileAvatar } from "@/src/components/ProfileAvatar";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { R, T } from "@/src/theme";
import {
  Camera,
  ChevronRight,
  ClipboardList,
  LifeBuoy,
  LogOut,
  MapPin,
  Settings,
  User,
} from "lucide-react-native";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToSavedAddresses: () => void;
  onNavigateToSettings: () => void;
  onNavigateToSupport: () => void;
  onNavigateToOrderHistory?: () => void;
}

export const ProfileScreen = ({
  onBack,
  onNavigateToEditProfile,
  onNavigateToSavedAddresses,
  onNavigateToSettings,
  onNavigateToSupport,
  onNavigateToOrderHistory,
}: ProfileScreenProps) => {
  const { signOut, userProfile, changeProfilePhoto } = useAuth();

  const memberSince = userProfile?.created_at
    ? new Date(userProfile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "";

  const handleChangePhoto = async () => {
    try {
      await changeProfilePhoto();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not update profile picture.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            onBack();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const rows = [
    { icon: User, label: "Edit profile", hint: "Name and phone", onPress: onNavigateToEditProfile },
    onNavigateToOrderHistory && {
      icon: ClipboardList,
      label: "Order history",
      hint: "Past orders and receipts",
      onPress: onNavigateToOrderHistory,
    },
    { icon: MapPin, label: "Saved places", hint: "Home, work and more", onPress: onNavigateToSavedAddresses },
    { icon: Settings, label: "Settings", hint: "Notifications and location", onPress: onNavigateToSettings },
    { icon: LifeBuoy, label: "Help & support", hint: "Call, WhatsApp or email us", onPress: onNavigateToSupport },
  ].filter(Boolean) as { icon: typeof User; label: string; hint: string; onPress: () => void }[];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.identity}>
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8} accessibilityLabel="Change profile picture">
            <ProfileAvatar size={84} />
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{userProfile?.display_name || "Briano's regular"}</Text>
          <Text style={styles.email}>{userProfile?.email}</Text>
          {!!memberSince && (
            <View style={styles.memberPill}>
              <Text style={styles.memberText}>Regular since {memberSince}</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.group}>
          {rows.map(({ icon: Icon, label, hint, onPress }, i) => (
            <TouchableOpacity
              key={label}
              style={[styles.row, i < rows.length - 1 && styles.rowDivider]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={styles.rowIcon}>
                <Icon size={18} color={T.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowHint}>{hint}</Text>
              </View>
              <ChevronRight size={18} color={T.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logout} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color={T.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, paddingBottom: 40 },

  identity: { alignItems: "center", paddingVertical: 20 },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.ember,
    borderWidth: 3,
    borderColor: T.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { color: T.text, fontSize: 22, fontWeight: "800", marginTop: 14 },
  email: { color: T.muted, fontSize: 14, marginTop: 2 },
  memberPill: { marginTop: 10, backgroundColor: T.emberSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: R.pill },
  memberText: { color: T.emberText, fontSize: 12, fontWeight: "700" },

  group: { backgroundColor: T.surface, borderRadius: R.lg, marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: T.border },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  rowLabel: { color: T.text, fontSize: 15, fontWeight: "700" },
  rowHint: { color: T.muted, fontSize: 12, marginTop: 1 },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: R.lg,
    backgroundColor: T.dangerSoft,
    marginTop: 20,
  },
  logoutText: { color: T.danger, fontSize: 15, fontWeight: "800" },
});
