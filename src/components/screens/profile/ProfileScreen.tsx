import { useAuth } from "@/src/auth/AuthContext";
import usersApiService, { UserProfile } from "@/src/services/users";
// navigation is received via callbacks in props; avoid using router hook here
import { ArrowLeft, ClipboardList, LogOut, MapPin, Phone, Settings, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

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
  onNavigateToOrderHistory
}: ProfileScreenProps) => {
  const { signOut } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const bg = isDark ? "#05070A" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111827";
  const subtitleText = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#1F2937" : "#F9FAFB";
  const accentColor = isDark ? "#4F46E5" : "#2563EB";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await usersApiService.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to default values if API fails
        setUserProfile({
          id: 1,
          email: ' ',
          display_name: ' ',
          phone: '',
          profile_image: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              onBack();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed

    style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "#374151" : "#E5E7EB" }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture and Info */}
        <View style={styles.profileSection}>
          <View style={[styles.profilePicture, { backgroundColor: "#3B82F6" }]}>
            <Text style={[styles.profileText, { color: text }]}>
              {userProfile?.display_name?.charAt(0).toUpperCase() || ''}
            </Text>
          </View>
          <Text style={[styles.name, { color: text }]}>
            {userProfile?.display_name || ''}
          </Text>
          <Text style={[styles.email, { color: subtitleText }]}>
            {userProfile?.email || ' '}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: cardBg }]} onPress={onNavigateToEditProfile}>
            <User size={20} color={accentColor} />
            <Text style={[styles.menuText, { color: text }]}>Edit Profile</Text>
          </TouchableOpacity>

          {onNavigateToOrderHistory && (
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: cardBg }]} onPress={onNavigateToOrderHistory}>
              <ClipboardList size={20} color={accentColor} />
              <Text style={[styles.menuText, { color: text }]}>Order History</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: cardBg }]} onPress={onNavigateToSavedAddresses}>
            <MapPin size={20} color={accentColor} />
            <Text style={[styles.menuText, { color: text }]}>Saved Addresses</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: cardBg }]} onPress={onNavigateToSettings}>
            <Settings size={20} color={accentColor} />
            <Text style={[styles.menuText, { color: text }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: cardBg }]} onPress={onNavigateToSupport}>
            <Phone size={20} color={accentColor} />
            <Text style={[styles.menuText, { color: text }]}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#EF4444" }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  profileSection: { alignItems: "center", marginBottom: 32 },
  profilePicture: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  profileText: { fontWeight: "700", fontSize: 32 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 16 },
  menuSection: { marginBottom: 32 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 8 },
  menuText: { fontSize: 16, fontWeight: "500", marginLeft: 12 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 12 },
  logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});
