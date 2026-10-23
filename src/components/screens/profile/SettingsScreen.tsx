import { ArrowLeft, Bell, Globe, Moon, Shield, Sun } from "lucide-react-native";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);

  const bg = isDark ? "#05070A" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111827";
  const subtitleText = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#1F2937" : "#F9FAFB";
  const accentColor = isDark ? "#4F46E5" : "#2563EB";

  const settingsSections = [
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          title: "Push Notifications",
          subtitle: "Receive delivery updates and offers",
          type: "switch",
          value: notifications,
          onValueChange: setNotifications,
        },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: Shield,
          title: "Location Services",
          subtitle: "Allow access to your location for better service",
          type: "switch",
          value: locationServices,
          onValueChange: setLocationServices,
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          icon: darkMode ? Moon : Sun,
          title: "Dark Mode",
          subtitle: "Toggle between light and dark themes",
          type: "switch",
          value: darkMode,
          onValueChange: setDarkMode,
        },
        {
          icon: Globe,
          title: "Language",
          subtitle: "English",
          type: "action",
          action: () => {},
        },
      ],
    },
  ];

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
        <Text style={[styles.headerTitle, { color: text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: text }]}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={[styles.settingItem, { backgroundColor: cardBg }]}>
                <View style={styles.itemLeft}>
                  <item.icon size={24} color={accentColor} />
                  <View style={styles.itemText}>
                    <Text style={[styles.itemTitle, { color: text }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: subtitleText }]}>{item.subtitle}</Text>
                  </View>
                </View>
                {item.type === "switch" ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: "#767577", true: accentColor }}
                    thumbColor={item.value ? "#FFFFFF" : "#f4f3f4"}
                  />
                ) : (
                  <TouchableOpacity onPress={item.action}>
                    <Text style={[styles.actionText, { color: accentColor }]}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  settingItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, marginBottom: 8 },
  itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  itemText: { marginLeft: 12, flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: "500" },
  itemSubtitle: { fontSize: 14, marginTop: 2 },
  actionText: { fontSize: 16, fontWeight: "500" },
});
