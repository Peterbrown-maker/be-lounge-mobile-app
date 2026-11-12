import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useCurrentLocation } from "@/src/location/useCurrentLocation";
import usersApiService from "@/src/services/users";
import { R, T } from "@/src/theme";
import { Briefcase, Home, LocateFixed, MapPin, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface SavedAddressesScreenProps {
  onBack: () => void;
}

interface Address {
  id: number;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  note?: string;
}

const LABELS = [
  { label: "Home", Icon: Home },
  { label: "Work", Icon: Briefcase },
  { label: "Other", Icon: MapPin },
];
const iconFor = (label: string) => LABELS.find((l) => l.label === label)?.Icon || MapPin;

export const SavedAddressesScreen = ({ onBack }: SavedAddressesScreenProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("Home");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { status: locStatus, location, refresh } = useCurrentLocation();

  const load = async () => {
    try {
      setAddresses(await usersApiService.getUserAddresses());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startAdding = () => {
    setLabel(addresses.some((a) => a.label === "Home") ? "Work" : "Home");
    setNote("");
    setAdding(true);
    refresh();
  };

  const save = async () => {
    if (!location) return;
    setSaving(true);
    try {
      await usersApiService.addUserAddress({
        label,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        note: note.trim() || undefined,
      });
      setAdding(false);
      await load();
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (a: Address) =>
    Alert.alert(`Remove ${a.label}?`, a.address, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await usersApiService.deleteUserAddress(a.id);
          setAddresses((prev) => prev.filter((x) => x.id !== a.id));
        },
      },
    ]);

  // ----- Add form -----
  if (adding) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScreenHeader title="Save this place" subtitle="Uses where you are right now" onBack={() => setAdding(false)} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.mapCard}>
            {location ? (
              <MapView
                style={StyleSheet.absoluteFill}
                region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                scrollEnabled={false}
                zoomEnabled={false}
                toolbarEnabled={false}
              >
                <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
                  <View style={styles.pin}>
                    <MapPin size={16} color="#FFF" />
                  </View>
                </Marker>
              </MapView>
            ) : (
              <View style={styles.mapEmpty}>
                {locStatus === "locating" ? (
                  <ActivityIndicator color={T.emberText} />
                ) : (
                  <Text style={styles.muted}>
                    {locStatus === "denied" ? "Location is off" : "Couldn't find you yet"}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <LocateFixed size={18} color={T.emberText} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>{location?.label || "Current location"}</Text>
              <Text style={styles.muted} numberOfLines={2}>{location?.address || "—"}</Text>
            </View>
            <TouchableOpacity
              onPress={() => (locStatus === "denied" ? Linking.openSettings() : refresh())}
              hitSlop={8}
              disabled={locStatus === "locating"}
            >
              <Text style={styles.link}>{locStatus === "denied" ? "Enable" : "Refresh"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Save as</Text>
          <View style={styles.labels}>
            {LABELS.map(({ label: l, Icon }) => {
              const active = label === l;
              return (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelChip, active && styles.labelChipActive]}
                  onPress={() => setLabel(l)}
                  accessibilityState={{ selected: active }}
                >
                  <Icon size={16} color={active ? "#FFF" : T.text} />
                  <Text style={[styles.labelText, active && { color: "#FFF" }]}>{l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Directions for the driver</Text>
          <TextInput
            style={styles.input}
            placeholder="Unit, gate code, colour of the gate…"
            placeholderTextColor={T.placeholder}
            value={note}
            onChangeText={setNote}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, (!location || saving) && styles.ctaDisabled]}
            onPress={save}
            disabled={!location || saving}
            activeOpacity={0.85}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.ctaText}>Save {label}</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ----- List -----
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Saved places"
        onBack={onBack}
        right={
          <TouchableOpacity style={styles.addBtn} onPress={startAdding} accessibilityLabel="Add a place">
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        }
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.emberText} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <MapPin size={28} color={T.muted} />
          </View>
          <Text style={styles.emptyTitle}>No saved places</Text>
          <Text style={styles.emptyText}>Save home or work so the driver always knows where to come.</Text>
          <TouchableOpacity style={[styles.cta, { alignSelf: "stretch", marginTop: 20 }]} onPress={startAdding}>
            <Text style={styles.ctaText}>Save my current location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {addresses.map((a) => {
            const Icon = iconFor(a.label);
            return (
              <View key={a.id} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Icon size={18} color={T.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{a.label}</Text>
                  <Text style={styles.muted} numberOfLines={2}>{a.address}</Text>
                  {!!a.note && <Text style={styles.note} numberOfLines={1}>{a.note}</Text>}
                </View>
                <TouchableOpacity onPress={() => remove(a)} hitSlop={8} accessibilityLabel={`Remove ${a.label}`}>
                  <Trash2 size={18} color={T.danger} />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  muted: { color: T.muted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  link: { color: T.emberText, fontSize: 13, fontWeight: "800" },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: T.ember, alignItems: "center", justifyContent: "center" },

  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.surface, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: T.text, fontSize: 18, fontWeight: "800" },
  emptyText: { color: T.muted, fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20 },

  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, backgroundColor: T.surface },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: T.text, fontSize: 15, fontWeight: "800" },
  note: { color: T.emberText, fontSize: 12, marginTop: 4, fontWeight: "600" },

  mapCard: { height: 190, borderRadius: R.xl, overflow: "hidden", backgroundColor: T.surface },
  mapEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  pin: { width: 34, height: 34, borderRadius: 17, backgroundColor: T.ember, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFF" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, backgroundColor: T.surface },
  locationLabel: { color: T.text, fontSize: 15, fontWeight: "700" },

  sectionTitle: { color: T.text, fontSize: 15, fontWeight: "800", marginTop: 10 },
  labels: { flexDirection: "row", gap: 8 },
  labelChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, height: 42, borderRadius: R.pill, backgroundColor: T.surface },
  labelChipActive: { backgroundColor: T.text },
  labelText: { color: T.text, fontSize: 14, fontWeight: "700" },
  input: { height: 50, borderRadius: R.md, backgroundColor: T.surface, paddingHorizontal: 14, fontSize: 15, color: T.text },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.bg },
  cta: { height: 54, borderRadius: R.lg, backgroundColor: T.ember, alignItems: "center", justifyContent: "center" },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
