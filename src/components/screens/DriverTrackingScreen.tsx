import { ordersApiService } from "@/src/services/orders";
import { MACNOSE_RESTAURANT } from "@/src/services/restaurants";
import { R, T } from "@/src/theme";
import { Bike, Check, ChefHat, Flame, MapPin, MessageCircle, Package, Phone, Star } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

interface DriverTrackingProps {
  paymentData: PaymentData;
  onOrderComplete?: (orderData: OrderCompletionData) => void;
  onCancel?: () => void;
}

interface PaymentData {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  bookingData: any;
  timestamp: string;
  deliveryCode?: string;
  orderId?: number;
}

interface OrderCompletionData {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  completedAt: string;
}

// Simulated delivery (no dispatch server): stage → seconds after the order.
type Stage = "confirmed" | "cooking" | "pickup" | "onway" | "arrived" | "delivered";
const TIMELINE: { stage: Stage; at: number; label: string; Icon: typeof Check }[] = [
  { stage: "confirmed", at: 0, label: "Order confirmed", Icon: Check },
  { stage: "cooking", at: 3, label: "On the fire", Icon: Flame },
  { stage: "pickup", at: 8, label: "Driver picking up", Icon: Package },
  { stage: "onway", at: 12, label: "On the way to you", Icon: Bike },
  { stage: "arrived", at: 24, label: "Driver is outside", Icon: MapPin },
];
const TRIP_SECONDS = TIMELINE[4].at - TIMELINE[3].at;

const DRIVER = {
  name: "Sipho M.",
  phone: "+27811234567",
  vehicle: "Honda scooter · GP 69 YTE",
  rating: 4.9,
  trips: 312,
};

export const DriverTrackingScreen: React.FC<DriverTrackingProps> = ({ paymentData, onOrderComplete, onCancel }) => {
  const [elapsed, setElapsed] = useState(0);
  const [delivered, setDelivered] = useState(false);
  const mapRef = useRef<MapView>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  const code = useMemo(
    () => paymentData.deliveryCode || String(Math.floor(100000 + Math.random() * 900000)),
    [paymentData.deliveryCode]
  );

  const shop = { latitude: MACNOSE_RESTAURANT.latitude, longitude: MACNOSE_RESTAURANT.longitude };
  const home = {
    latitude: paymentData.bookingData?.deliveryLatitude ?? shop.latitude - 0.012,
    longitude: paymentData.bookingData?.deliveryLongitude ?? shop.longitude + 0.01,
  };

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => (e >= TIMELINE[4].at ? e : e + 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    mapRef.current?.fitToCoordinates([shop, home], {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  }, []);

  const currentIdx = TIMELINE.reduce((idx, s, i) => (elapsed >= s.at ? i : idx), 0);
  const stage = TIMELINE[currentIdx].stage;
  const tripProgress = Math.min(1, Math.max(0, (elapsed - TIMELINE[3].at) / TRIP_SECONDS));
  const driverPos = {
    latitude: shop.latitude + (home.latitude - shop.latitude) * tripProgress,
    longitude: shop.longitude + (home.longitude - shop.longitude) * tripProgress,
  };
  // Display ETA in "real" minutes (prototype runs ~25× faster).
  const etaMin = Math.max(1, Math.round(((TIMELINE[4].at - elapsed) / TIMELINE[4].at) * 30));

  const headline =
    stage === "arrived"
      ? "Your driver is outside"
      : stage === "onway"
        ? `Arriving in ${etaMin} min`
        : stage === "pickup"
          ? "Driver picking up your order"
          : stage === "cooking"
            ? "Your order is on the fire"
            : "Order confirmed";

  // Keep the saved order's status in step with the simulation.
  useEffect(() => {
    if (!paymentData.orderId) return;
    if (stage === "onway") ordersApiService.updateOrderStatus(paymentData.orderId, "on_the_way").catch(() => {});
  }, [stage]);
  useEffect(() => {
    if (delivered && paymentData.orderId) {
      ordersApiService.updateOrderStatus(paymentData.orderId, "delivered").catch(() => {});
    }
  }, [delivered]);

  const finish = () =>
    onOrderComplete?.({
      orderId: paymentData.paymentId,
      orderCode: code,
      totalAmount: paymentData.amount,
      completedAt: new Date().toISOString(),
    });

  const confirmCancel = () =>
    Alert.alert("Cancel order?", "If we've started cooking we may not be able to refund the full amount.", [
      { text: "Keep order", style: "cancel" },
      {
        text: "Cancel order",
        style: "destructive",
        onPress: async () => {
          if (paymentData.orderId) {
            await ordersApiService.updateOrderStatus(paymentData.orderId, "cancelled").catch(() => {});
          }
          onCancel?.();
        },
      },
    ]);

  if (delivered) {
    return (
      <View style={[styles.container, styles.doneWrap]}>
        <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
        <View style={styles.doneBadge}>
          <Check size={44} color="#FFF" strokeWidth={3} />
        </View>
        <Text style={styles.doneTitle}>Enjoy your meal!</Text>
        <Text style={styles.doneSub}>Thanks for ordering from MacNose. Take a Short Left and come through soon.</Text>
        <View style={styles.receipt}>
          <ReceiptRow label="Reference" value={paymentData.paymentId} />
          <ReceiptRow label="Total" value={`R${paymentData.amount.toFixed(2)}`} />
        </View>
        <TouchableOpacity style={styles.primary} onPress={finish} activeOpacity={0.85}>
          <Text style={styles.primaryText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: (shop.latitude + home.latitude) / 2,
            longitude: (shop.longitude + home.longitude) / 2,
            latitudeDelta: Math.abs(shop.latitude - home.latitude) * 2.5 + 0.01,
            longitudeDelta: Math.abs(shop.longitude - home.longitude) * 2.5 + 0.01,
          }}
          showsUserLocation
          toolbarEnabled={false}
        >
          <Polyline coordinates={[shop, home]} strokeColor={T.text} strokeWidth={3} lineDashPattern={[6, 6]} />
          <Marker coordinate={shop} title="MacNose Cafe" anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.shopPin}>
              <ChefHat size={16} color="#FFF" />
            </View>
          </Marker>
          <Marker coordinate={home} title="You" anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.homePin}>
              <MapPin size={16} color="#FFF" />
            </View>
          </Marker>
          {currentIdx >= 3 && (
            <Marker coordinate={driverPos} title={DRIVER.name} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.driverPin}>
                <Bike size={18} color="#FFF" />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Sheet */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grabber} />
        <View style={styles.statusRow}>
          <View style={styles.liveDotWrap}>
            <Animated.View style={[styles.liveRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.headline}>{headline}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((currentIdx + (stage === "onway" ? tripProgress : 0)) / 4) * 100}%` }]} />
        </View>

        {/* Delivery code */}
        <View style={styles.codeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.codeLabel}>Delivery code</Text>
            <Text style={styles.codeHint}>Give this to your driver</Text>
          </View>
          <Text style={styles.code}>{code}</Text>
        </View>

        {/* Driver */}
        {currentIdx >= 2 && (
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>{DRIVER.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{DRIVER.name}</Text>
              <View style={styles.ratingRow}>
                <Star size={12} color={T.emberText} fill={T.emberText} />
                <Text style={styles.driverMeta}>{DRIVER.rating} · {DRIVER.trips} trips</Text>
              </View>
              <Text style={styles.driverMeta}>{DRIVER.vehicle}</Text>
            </View>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => Linking.openURL(`https://wa.me/${DRIVER.phone.replace("+", "")}`).catch(() => {})}
              accessibilityLabel="Message driver"
            >
              <MessageCircle size={18} color={T.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roundBtn, { backgroundColor: T.text }]}
              onPress={() => Linking.openURL(`tel:${DRIVER.phone}`).catch(() => {})}
              accessibilityLabel="Call driver"
            >
              <Phone size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timeline}>
          {TIMELINE.map((s, i) => {
            const doneStep = i < currentIdx;
            const active = i === currentIdx;
            return (
              <View key={s.stage} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View style={[styles.tlDot, doneStep && styles.tlDotDone, active && styles.tlDotActive]}>
                    <s.Icon size={13} color={doneStep || active ? (active ? "#000" : "#FFF") : T.placeholder} />
                  </View>
                  {i < TIMELINE.length - 1 && <View style={[styles.tlLine, doneStep && { backgroundColor: T.text }]} />}
                </View>
                <Text style={[styles.tlLabel, (doneStep || active) && { color: T.text }, active && { fontWeight: "800" }]}>
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>

        {!!paymentData.bookingData?.deliveryAddress && (
          <Text style={styles.address} numberOfLines={2}>
            Delivering to {paymentData.bookingData.deliveryAddress}
          </Text>
        )}

        {stage === "arrived" ? (
          <TouchableOpacity style={styles.primary} onPress={() => setDelivered(true)} activeOpacity={0.85}>
            <Text style={styles.primaryText}>I've got my order</Text>
          </TouchableOpacity>
        ) : (
          currentIdx < 2 && (
            <TouchableOpacity style={styles.cancel} onPress={confirmCancel}>
              <Text style={styles.cancelText}>Cancel order</Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </View>
  );
};

const ReceiptRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.receiptRow}>
    <Text style={styles.receiptLabel}>{label}</Text>
    <Text style={styles.receiptValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  mapWrap: { height: "42%", backgroundColor: T.surface },
  shopPin: { width: 34, height: 34, borderRadius: 17, backgroundColor: T.text, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFF" },
  homePin: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: T.text },
  driverPin: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.ember, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFF" },

  sheet: { flex: 1, marginTop: -20, backgroundColor: T.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { padding: 16, paddingTop: 10, paddingBottom: 32 },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: T.border, marginBottom: 14 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveDotWrap: { width: 14, height: 14, alignItems: "center", justifyContent: "center" },
  liveRing: { position: "absolute", width: 14, height: 14, borderRadius: 7, backgroundColor: T.ember },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.ember },
  headline: { color: T.text, fontSize: 22, fontWeight: "800", flex: 1 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: T.surface, marginTop: 14, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: T.ember },

  codeCard: { flexDirection: "row", alignItems: "center", marginTop: 16, padding: 14, borderRadius: R.lg, backgroundColor: T.text },
  codeLabel: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  codeHint: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },
  code: { color: T.ember, fontSize: 26, fontWeight: "900", letterSpacing: 4 },

  driverCard: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, padding: 14, borderRadius: R.lg, backgroundColor: T.surface },
  driverAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: T.text, alignItems: "center", justifyContent: "center" },
  driverInitial: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  driverName: { color: T.text, fontSize: 15, fontWeight: "800" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  driverMeta: { color: T.muted, fontSize: 12, marginTop: 1 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },

  timeline: { marginTop: 18 },
  tlRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tlLeft: { alignItems: "center", width: 26 },
  tlDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: T.surface, alignItems: "center", justifyContent: "center" },
  tlDotDone: { backgroundColor: T.text },
  tlDotActive: { backgroundColor: T.ember },
  tlLine: { width: 2, height: 18, backgroundColor: T.border, marginVertical: 2 },
  tlLabel: { color: T.placeholder, fontSize: 14, fontWeight: "600", paddingTop: 4 },

  address: { color: T.muted, fontSize: 13, marginTop: 14, lineHeight: 19 },
  primary: { height: 56, borderRadius: R.lg, backgroundColor: T.ember, alignItems: "center", justifyContent: "center", marginTop: 18, alignSelf: "stretch" },
  primaryText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  cancel: { alignItems: "center", paddingVertical: 14, marginTop: 10 },
  cancelText: { color: T.danger, fontSize: 14, fontWeight: "700" },

  doneWrap: { alignItems: "center", justifyContent: "center", padding: 24 },
  doneBadge: { width: 96, height: 96, borderRadius: 48, backgroundColor: T.ember, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  doneTitle: { color: T.text, fontSize: 28, fontWeight: "800" },
  doneSub: { color: T.muted, fontSize: 15, textAlign: "center", marginTop: 6, lineHeight: 22 },
  receipt: { alignSelf: "stretch", backgroundColor: T.surface, borderRadius: R.lg, padding: 14, marginTop: 24 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  receiptLabel: { color: T.muted, fontSize: 14 },
  receiptValue: { color: T.text, fontSize: 14, fontWeight: "700" },
});
