import { useAuth } from "@/src/auth/AuthContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useCurrentLocation } from "@/src/location/useCurrentLocation";
import { MAKHANANI_RESTAURANT } from "@/src/services/restaurants";
import { R, T } from "@/src/theme";
import { CalendarDays, Clock, LocateFixed, ShoppingBag, Store, Users, Utensils, Zap } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

type BookingType = "delivery" | "sitin" | "takeaway";

interface CheckoutProps {
  onBack?: () => void;
  onPayment?: (bookingData: BookingData) => void;
  cartItems?: CartItem[];
  totalPrice?: number;
  /** Which booking type to start on (chosen on the Home screen). */
  initialBookingType?: BookingType;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: any;
}

export interface BookingData {
  bookingType: BookingType;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  sitInTime?: string;
  partySize?: number;
  location?: "inside" | "patio" | "private";
  specialRequests?: string;
  /** Food subtotal (before fees). */
  subtotal?: number;
  deliveryFee?: number;
  /** Amount to pay = subtotal + deliveryFee. */
  totalPrice: number;
  items?: { id: string; name: string; price: number; quantity: number }[];
  userEmail?: string;
  userName?: string;
}

const MODES: { id: BookingType; label: string; hint: string; Icon: typeof Zap }[] = [
  { id: "delivery", label: "Delivery", hint: "To you", Icon: Zap },
  { id: "takeaway", label: "Collect", hint: "~20 min", Icon: ShoppingBag },
  { id: "sitin", label: "Sit-in", hint: "Book a table", Icon: Utensils },
];

const TIMES = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const PARTY = ["2", "3", "4", "5", "6", "8", "10", "10+"];
const SEATING = [
  { label: "Inside", value: "inside" as const, hint: "At the tables" },
  { label: "Patio", value: "patio" as const, hint: "By the fire" },
  { label: "VIP", value: "private" as const, hint: "Private area" },
];

export const CheckoutScreen: React.FC<CheckoutProps> = ({
  onBack,
  onPayment,
  cartItems = [],
  initialBookingType = "delivery",
}) => {
  const { user, userProfile } = useAuth();
  const { status: locStatus, location: gpsLocation, refresh: refreshLocation } = useCurrentLocation();

  const [bookingType, setBookingType] = useState<BookingType>(initialBookingType);
  const [addressNote, setAddressNote] = useState("");
  const [sitInTime, setSitInTime] = useState("19:00");
  const [partySize, setPartySize] = useState("4");
  const [seating, setSeating] = useState<"inside" | "patio" | "private">("inside");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((n, i) => n + i.price * i.quantity, 0);
  const deliveryFee = bookingType === "delivery" ? MAKHANANI_RESTAURANT.delivery_fee : 0;
  const total = subtotal + deliveryFee;
  const tableOnly = bookingType === "sitin" && cartItems.length === 0;

  const handleContinue = () => {
    if (bookingType === "delivery" && !gpsLocation) {
      Alert.alert(
        "We need your location",
        locStatus === "denied"
          ? "Turn on location access so we can deliver to where you are."
          : "Still finding you — try again in a moment.",
        locStatus === "denied"
          ? [{ text: "Cancel", style: "cancel" }, { text: "Open settings", onPress: () => Linking.openSettings() }]
          : undefined
      );
      refreshLocation();
      return;
    }
    if (bookingType !== "sitin" && cartItems.length === 0) {
      Alert.alert("Your order is empty", "Add something from the menu first.");
      return;
    }

    setLoading(true);
    const bookingData: BookingData = {
      bookingType,
      deliveryAddress:
        bookingType === "delivery" && gpsLocation
          ? [gpsLocation.address, addressNote.trim()].filter(Boolean).join(" — ")
          : undefined,
      deliveryLatitude: bookingType === "delivery" ? gpsLocation?.latitude : undefined,
      deliveryLongitude: bookingType === "delivery" ? gpsLocation?.longitude : undefined,
      sitInTime: bookingType === "sitin" ? sitInTime : undefined,
      partySize: bookingType === "sitin" ? parseInt(partySize, 10) || 10 : undefined,
      location: bookingType === "sitin" ? seating : undefined,
      specialRequests: specialRequests.trim() || undefined,
      subtotal,
      deliveryFee,
      totalPrice: total,
      items: cartItems.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      userEmail: user?.email || userProfile?.email || "",
      userName: userProfile?.display_name || user?.displayName || "Guest",
    };
    setTimeout(() => {
      setLoading(false);
      onPayment?.(bookingData);
    }, 300);
  };

  const ctaLabel = tableOnly ? "Confirm booking" : `Continue to payment · R${total.toFixed(2)}`;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader title={tableOnly ? "Book a table" : "Checkout"} subtitle="Makhanani Shisanyama" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Mode */}
        <View style={styles.modes}>
          {MODES.map(({ id, label, hint, Icon }) => {
            const active = bookingType === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.mode, active && styles.modeActive]}
                onPress={() => {
                  setBookingType(id);
                  if (id === "delivery" && locStatus !== "ready") refreshLocation();
                }}
                accessibilityState={{ selected: active }}
                activeOpacity={0.8}
              >
                <Icon size={20} color={active ? "#FFF" : T.text} />
                <Text style={[styles.modeLabel, active && { color: "#FFF" }]}>{label}</Text>
                <Text style={[styles.modeHint, active && { color: "rgba(255,255,255,0.7)" }]}>{hint}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Delivery: current location */}
        {bookingType === "delivery" && (
          <Section title="Delivering to">
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                {locStatus === "locating" ? (
                  <ActivityIndicator size="small" color={T.emberText} />
                ) : (
                  <LocateFixed size={18} color={T.emberText} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                {gpsLocation ? (
                  <>
                    <Text style={styles.locationLabel}>{gpsLocation.label}</Text>
                    <Text style={styles.locationAddress} numberOfLines={2}>{gpsLocation.address}</Text>
                  </>
                ) : (
                  <Text style={styles.locationLabel}>
                    {locStatus === "locating"
                      ? "Finding your location…"
                      : locStatus === "denied"
                        ? "Location is off"
                        : "Couldn't get your location"}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => (locStatus === "denied" ? Linking.openSettings() : refreshLocation())}
                disabled={locStatus === "locating"}
                hitSlop={8}
              >
                <Text style={styles.link}>{locStatus === "denied" ? "Enable" : gpsLocation ? "Refresh" : "Retry"}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Unit, gate code or landmark (optional)"
              placeholderTextColor={T.placeholder}
              value={addressNote}
              onChangeText={setAddressNote}
            />
          </Section>
        )}

        {/* Collect */}
        {bookingType === "takeaway" && (
          <Section title="Collect from">
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Store size={18} color={T.emberText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Makhanani Shisanyama</Text>
                <Text style={styles.locationAddress}>Ready in about 20 min</Text>
              </View>
            </View>
          </Section>
        )}

        {/* Sit-in */}
        {bookingType === "sitin" && (
          <Section title="Your table">
            <FieldLabel Icon={Clock} label="Arrival time" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {TIMES.map((t) => (
                <Chip key={t} label={t} active={sitInTime === t} onPress={() => setSitInTime(t)} />
              ))}
            </ScrollView>

            <FieldLabel Icon={Users} label="Guests" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {PARTY.map((p) => (
                <Chip key={p} label={p} active={partySize === p} onPress={() => setPartySize(p)} />
              ))}
            </ScrollView>

            <FieldLabel Icon={CalendarDays} label="Where" />
            <View style={styles.seating}>
              {SEATING.map((s) => {
                const active = seating === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.seat, active && styles.seatActive]}
                    onPress={() => setSeating(s.value)}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.seatLabel, active && { color: "#FFF" }]}>{s.label}</Text>
                    <Text style={[styles.seatHint, active && { color: "rgba(255,255,255,0.7)" }]}>{s.hint}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>
        )}

        {/* Items */}
        {cartItems.length > 0 && (
          <Section title={bookingType === "sitin" ? "Pre-order for your table" : "Your order"}>
            <View style={styles.card}>
              {cartItems.map((item, i) => (
                <View key={item.id} style={[styles.itemRow, i < cartItems.length - 1 && styles.divider]}>
                  {item.image ? <Image source={item.image} style={styles.itemImage} /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemQty}>× {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>R{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        <Section title="Notes for the kitchen">
          <TextInput
            style={[styles.input, { minHeight: 80, paddingTop: 14 }]}
            placeholder={bookingType === "sitin" ? "Birthday? Bottle service? Let us know." : "Allergies, how you like your steak…"}
            placeholderTextColor={T.placeholder}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            textAlignVertical="top"
          />
        </Section>

        {/* Totals */}
        {!tableOnly && (
          <View style={[styles.card, { marginTop: 20 }]}>
            <Row label="Subtotal" value={`R${subtotal.toFixed(2)}`} />
            <Row label="Delivery fee" value={deliveryFee ? `R${deliveryFee.toFixed(2)}` : "Free"} />
            <View style={[styles.divider, { marginVertical: 10 }]} />
            <Row label="Total" value={`R${total.toFixed(2)}`} bold />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.ctaText}>{ctaLabel}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ marginTop: 22 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const FieldLabel = ({ Icon, label }: { Icon: typeof Clock; label: string }) => (
  <View style={styles.fieldLabel}>
    <Icon size={16} color={T.muted} />
    <Text style={styles.fieldLabelText}>{label}</Text>
  </View>
);

const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    accessibilityState={{ selected: active }}
  >
    <Text style={[styles.chipText, active && { color: "#FFF" }]}>{label}</Text>
  </TouchableOpacity>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.totalRow}>
    <Text style={[styles.totalLabel, bold && styles.totalBold]}>{label}</Text>
    <Text style={[styles.totalValue, bold && styles.totalBold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: { color: T.text, fontSize: 17, fontWeight: "800", marginBottom: 10 },

  modes: { flexDirection: "row", gap: 10, marginTop: 4 },
  mode: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 14, borderRadius: R.lg, backgroundColor: T.surface },
  modeActive: { backgroundColor: T.text },
  modeLabel: { color: T.text, fontSize: 14, fontWeight: "800" },
  modeHint: { color: T.muted, fontSize: 11 },

  locationCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, backgroundColor: T.surface },
  locationIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: T.emberSoft, alignItems: "center", justifyContent: "center" },
  locationLabel: { color: T.text, fontSize: 15, fontWeight: "700" },
  locationAddress: { color: T.muted, fontSize: 12, marginTop: 2 },
  link: { color: T.emberText, fontSize: 13, fontWeight: "800" },

  input: {
    minHeight: 50,
    borderRadius: R.md,
    backgroundColor: T.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: T.text,
  },

  fieldLabel: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 8 },
  fieldLabelText: { color: T.muted, fontSize: 13, fontWeight: "700" },
  chips: { gap: 8, paddingBottom: 10 },
  chip: { paddingHorizontal: 16, height: 40, borderRadius: R.pill, backgroundColor: T.surface, justifyContent: "center" },
  chipActive: { backgroundColor: T.text },
  chipText: { color: T.text, fontSize: 14, fontWeight: "700" },
  seating: { flexDirection: "row", gap: 8 },
  seat: { flex: 1, paddingVertical: 12, borderRadius: R.md, backgroundColor: T.surface, alignItems: "center" },
  seatActive: { backgroundColor: T.text },
  seatLabel: { color: T.text, fontSize: 14, fontWeight: "800" },
  seatHint: { color: T.muted, fontSize: 11, marginTop: 2 },

  card: { backgroundColor: T.surface, borderRadius: R.lg, padding: 14 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  divider: { borderBottomWidth: 1, borderBottomColor: T.border },
  itemImage: { width: 48, height: 48, borderRadius: 10 },
  itemName: { color: T.text, fontSize: 15, fontWeight: "700" },
  itemQty: { color: T.muted, fontSize: 13, marginTop: 2 },
  itemPrice: { color: T.text, fontSize: 15, fontWeight: "800" },

  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { color: T.muted, fontSize: 14 },
  totalValue: { color: T.text, fontSize: 14, fontWeight: "600" },
  totalBold: { color: T.text, fontSize: 17, fontWeight: "800" },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.bg },
  cta: { height: 56, borderRadius: R.lg, backgroundColor: T.ember, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#000", fontSize: 16, fontWeight: "800" },
});
