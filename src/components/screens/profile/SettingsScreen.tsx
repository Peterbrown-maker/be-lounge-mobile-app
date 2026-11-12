import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useCurrentLocation } from "@/src/location/useCurrentLocation";
import { R, T } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bell, ChevronRight, Globe, LocateFixed, Megaphone } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface SettingsScreenProps {
  onBack: () => void;
}

const PREFS_KEY = "settings:prefs";
type Prefs = { orderUpdates: boolean; lineupAlerts: boolean };

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [prefs, setPrefs] = useState<Prefs>({ orderUpdates: true, lineupAlerts: true });
  const { status: locStatus, location, refresh } = useCurrentLocation();

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => raw && setPrefs((p) => ({ ...p, ...JSON.parse(raw) })))
      .catch(() => {});
  }, []);

  const toggle = (key: keyof Prefs) => (value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
  };

  const locationHint =
    locStatus === "ready" && location
      ? `On · ${location.label}`
      : locStatus === "denied"
        ? "Off — needed for delivery"
        : locStatus === "locating"
          ? "Checking…"
          : "Tap to check";

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.group}>
          <SwitchRow
            Icon={Bell}
            title="Order updates"
            hint="When your order is on the fire and on its way"
            value={prefs.orderUpdates}
            onValueChange={toggle("orderUpdates")}
            divider
          />
          <SwitchRow
            Icon={Megaphone}
            title="News & specials"
            hint="What's new at Be Lounge"
            value={prefs.lineupAlerts}
            onValueChange={toggle("lineupAlerts")}
          />
        </View>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => (locStatus === "denied" ? Linking.openSettings() : refresh())}
            activeOpacity={0.7}
          >
            <View style={styles.rowIcon}>
              <LocateFixed size={18} color={T.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Location</Text>
              <Text style={[styles.rowHint, locStatus === "denied" && { color: T.danger }]}>{locationHint}</Text>
            </View>
            <Text style={styles.link}>{locStatus === "denied" ? "Open settings" : "Refresh"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Globe size={18} color={T.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Language</Text>
              <Text style={styles.rowHint}>English</Text>
            </View>
            <ChevronRight size={18} color={T.placeholder} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const SwitchRow = ({
  Icon,
  title,
  hint,
  value,
  onValueChange,
  divider,
}: {
  Icon: typeof Bell;
  title: string;
  hint: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  divider?: boolean;
}) => (
  <View style={[styles.row, divider && styles.rowDivider]}>
    <View style={styles.rowIcon}>
      <Icon size={18} color={T.text} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowHint}>{hint}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: T.border, true: T.ember }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={T.border}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: T.muted, fontSize: 12, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 16, marginBottom: 8, marginLeft: 4 },
  group: { backgroundColor: T.surface, borderRadius: R.lg },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: T.border },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  rowTitle: { color: T.text, fontSize: 15, fontWeight: "700" },
  rowHint: { color: T.muted, fontSize: 12, marginTop: 1 },
  link: { color: T.emberText, fontSize: 13, fontWeight: "800" },
});
