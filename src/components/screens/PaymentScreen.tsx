import { useAuth } from "@/src/auth/AuthContext";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { ordersApiService } from "@/src/services/orders";
import { MACNOSE_RESTAURANT } from "@/src/services/restaurants";
import { R, T } from "@/src/theme";
import { Banknote, Check, CreditCard, Lock } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { BookingData } from "./CheckoutScreen";

type Method = "card" | "cash";

interface PaymentProps {
  onBack?: () => void;
  /** Delivery orders continue to live tracking. */
  onPaymentSuccess?: (paymentData: PaymentData) => void;
  /** Collect / sit-in orders finish here and return home. */
  onDone?: () => void;
  bookingData: BookingData;
}

interface PaymentData {
  paymentId: string;
  amount: number;
  paymentMethod: Method;
  status: "pending" | "completed" | "failed";
  bookingData: BookingData;
  timestamp: string;
  deliveryCode?: string;
  orderId?: number;
}

const SEATING_LABEL: Record<string, string> = { inside: "Inside", patio: "Patio", private: "VIP area" };

export const PaymentScreen: React.FC<PaymentProps> = ({ onBack, onPaymentSuccess, onDone, bookingData }) => {
  const { user } = useAuth();
  const isFree = bookingData.totalPrice <= 0;
  const isDelivery = bookingData.bookingType === "delivery";

  const [method, setMethod] = useState<Method>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<{ paymentId: string; code?: string } | null>(null);

  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (done) Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [done]);

  const subtotal = bookingData.subtotal ?? bookingData.totalPrice;
  const deliveryFee = bookingData.deliveryFee ?? 0;

  const cashLabel = isDelivery ? "Cash on delivery" : bookingData.bookingType === "sitin" ? "Pay at the table" : "Pay at the counter";

  const validCard = () => {
    const digits = cardNumber.replace(/\s/g, "");
    if (!cardName.trim()) return "Enter the name on the card";
    if (digits.length < 16) return "Card number should be 16 digits";
    const [mm, yy] = cardExpiry.split("/").map((n) => parseInt(n, 10));
    if (!mm || mm > 12 || !yy) return "Expiry should be MM/YY";
    if (cardCVV.length < 3) return "CVV should be 3 or 4 digits";
    return "";
  };

  const submit = async () => {
    if (!isFree && method === "card") {
      const err = validCard();
      if (err) return Alert.alert("Check your card", err);
    }
    setProcessing(true);
    let code: string | undefined;
    let orderId: number | undefined;
    try {
      // Save to local order history.
      const res = await ordersApiService.createOrder({
        user_id: user?.uid || "guest",
        restaurant_id: MACNOSE_RESTAURANT.id,
        total_amount: Math.max(bookingData.totalPrice, 0.01),
        delivery_fee: deliveryFee,
        delivery_address:
          bookingData.deliveryAddress ||
          (bookingData.bookingType === "sitin"
            ? `Table for ${bookingData.partySize} at ${bookingData.sitInTime}`
            : "Collect at MacNose"),
        delivery_latitude: bookingData.deliveryLatitude ?? MACNOSE_RESTAURANT.latitude,
        delivery_longitude: bookingData.deliveryLongitude ?? MACNOSE_RESTAURANT.longitude,
        special_instructions: bookingData.specialRequests,
        items: (bookingData.items?.length ? bookingData.items : [{ id: "table", name: "Table booking", price: 0, quantity: 1 }]).map(
          (i) => ({ menu_item_id: i.id, quantity: i.quantity, price: i.price })
        ),
      });
      code = res.delivery_code;
      orderId = res.id;
    } catch (e) {
      console.warn("Could not save order locally:", e);
    }

    // Simulated payment (no payment server in this prototype).
    setTimeout(() => {
      setProcessing(false);
      const paymentId = `BR-${Date.now().toString().slice(-6)}`;
      setDone({ paymentId, code });
      if (isDelivery) {
        setTimeout(() => {
          onPaymentSuccess?.({
            paymentId,
            amount: bookingData.totalPrice,
            paymentMethod: method,
            status: method === "cash" ? "pending" : "completed",
            bookingData,
            timestamp: new Date().toISOString(),
            deliveryCode: code,
            orderId,
          });
        }, 2200);
      }
    }, isFree ? 500 : 1500);
  };

  const formatCardNumber = (t: string) =>
    setCardNumber(t.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "));
  const formatExpiry = (t: string) => {
    const d = t.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  // ----- Success -----
  if (done) {
    const title = isDelivery ? "Order placed!" : bookingData.bookingType === "sitin" ? "Table booked!" : "Order placed!";
    const subtitle = isDelivery
      ? "We're on it. Finding you a driver…"
      : bookingData.bookingType === "sitin"
        ? `See you at ${bookingData.sitInTime} · ${bookingData.partySize} guests · ${SEATING_LABEL[bookingData.location || "inside"]}`
        : "We'll have it ready at the counter in about 20 minutes.";
    return (
      <View style={[styles.container, styles.success]}>
        <Animated.View style={[styles.successBadge, { transform: [{ scale: pop }] }]}>
          <Check size={44} color="#FFF" strokeWidth={3} />
        </Animated.View>
        <Text style={styles.successTitle}>{title}</Text>
        <Text style={styles.successSub}>{subtitle}</Text>

        <View style={styles.receipt}>
          <ReceiptRow label="Reference" value={done.paymentId} />
          {!isFree && <ReceiptRow label="Amount" value={`R${bookingData.totalPrice.toFixed(2)}`} />}
          {!isFree && <ReceiptRow label="Payment" value={method === "card" ? "Card" : cashLabel} />}
          {!!done.code && isDelivery && <ReceiptRow label="Delivery code" value={done.code} highlight />}
        </View>

        {isDelivery ? (
          <View style={styles.successFooter}>
            <ActivityIndicator color={T.emberText} />
          </View>
        ) : (
          <TouchableOpacity style={styles.successBtn} onPress={onDone} activeOpacity={0.85}>
            <Text style={styles.successBtnText}>Back to home</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ----- Form -----
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader title={isFree ? "Confirm booking" : "Payment"} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Summary */}
        <View style={styles.card}>
          {bookingData.bookingType === "sitin" && (
            <Text style={styles.summaryLead}>
              Table for {bookingData.partySize} · {bookingData.sitInTime} · {SEATING_LABEL[bookingData.location || "inside"]}
            </Text>
          )}
          {isDelivery && !!bookingData.deliveryAddress && (
            <Text style={styles.summaryLead} numberOfLines={2}>To: {bookingData.deliveryAddress}</Text>
          )}
          {!isFree && (
            <>
              <Row label="Subtotal" value={`R${subtotal.toFixed(2)}`} />
              <Row label="Delivery fee" value={deliveryFee ? `R${deliveryFee.toFixed(2)}` : "Free"} />
              <View style={styles.divider} />
              <Row label="Total" value={`R${bookingData.totalPrice.toFixed(2)}`} bold />
            </>
          )}
        </View>

        {!isFree && (
          <>
            <Text style={styles.sectionTitle}>How do you want to pay?</Text>
            <MethodOption
              Icon={CreditCard}
              title="Card"
              hint="Visa or Mastercard"
              active={method === "card"}
              onPress={() => setMethod("card")}
            />
            <MethodOption
              Icon={Banknote}
              title={cashLabel}
              hint="Cash or card machine"
              active={method === "cash"}
              onPress={() => setMethod("cash")}
            />

            {method === "card" && (
              <View style={{ marginTop: 12, gap: 10 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Name on card"
                  placeholderTextColor={T.placeholder}
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Card number"
                  placeholderTextColor={T.placeholder}
                  value={cardNumber}
                  onChangeText={formatCardNumber}
                  keyboardType="number-pad"
                  maxLength={19}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="MM/YY"
                    placeholderTextColor={T.placeholder}
                    value={cardExpiry}
                    onChangeText={formatExpiry}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="CVV"
                    placeholderTextColor={T.placeholder}
                    value={cardCVV}
                    onChangeText={(t) => setCardCVV(t.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
                <View style={styles.secure}>
                  <Lock size={13} color={T.muted} />
                  <Text style={styles.secureText}>Demo checkout — no real card is charged.</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, processing && { opacity: 0.7 }]} onPress={submit} disabled={processing} activeOpacity={0.85}>
          {processing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaText}>
              {isFree ? "Confirm booking" : method === "card" ? `Pay R${bookingData.totalPrice.toFixed(2)}` : "Place order"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const MethodOption = ({
  Icon,
  title,
  hint,
  active,
  onPress,
}: {
  Icon: typeof CreditCard;
  title: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.method, active && styles.methodActive]}
    onPress={onPress}
    accessibilityState={{ selected: active }}
    activeOpacity={0.8}
  >
    <View style={styles.methodIcon}>
      <Icon size={18} color={T.text} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.methodTitle}>{title}</Text>
      <Text style={styles.methodHint}>{hint}</Text>
    </View>
    <View style={[styles.radio, active && styles.radioActive]}>{active && <View style={styles.radioDot} />}</View>
  </TouchableOpacity>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
  </View>
);

const ReceiptRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, highlight && { color: T.emberText, fontWeight: "800", letterSpacing: 2 }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: T.surface, borderRadius: R.lg, padding: 14 },
  summaryLead: { color: T.text, fontSize: 14, fontWeight: "700", marginBottom: 8 },
  divider: { height: 1, backgroundColor: T.border, marginVertical: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4, gap: 12 },
  rowLabel: { color: T.muted, fontSize: 14 },
  rowValue: { color: T.text, fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  rowBold: { color: T.text, fontSize: 17, fontWeight: "800" },
  sectionTitle: { color: T.text, fontSize: 17, fontWeight: "800", marginTop: 22, marginBottom: 10 },

  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: R.lg,
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.surface,
    marginBottom: 10,
  },
  methodActive: { borderColor: T.text, backgroundColor: T.bg },
  methodIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  methodTitle: { color: T.text, fontSize: 15, fontWeight: "700" },
  methodHint: { color: T.muted, fontSize: 12, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: T.text },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.text },

  input: { height: 50, borderRadius: R.md, backgroundColor: T.surface, paddingHorizontal: 14, fontSize: 15, color: T.text },
  secure: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  secureText: { color: T.muted, fontSize: 12 },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.bg },
  cta: { height: 56, borderRadius: R.lg, backgroundColor: T.ember, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

  success: { alignItems: "center", justifyContent: "center", padding: 24 },
  successBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: T.ember,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: T.ember,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  successTitle: { color: T.text, fontSize: 28, fontWeight: "800" },
  successSub: { color: T.muted, fontSize: 15, textAlign: "center", marginTop: 6, lineHeight: 22 },
  receipt: { alignSelf: "stretch", backgroundColor: T.surface, borderRadius: R.lg, padding: 14, marginTop: 24 },
  successFooter: { marginTop: 24 },
  successBtn: { alignSelf: "stretch", height: 56, borderRadius: R.lg, backgroundColor: T.text, alignItems: "center", justifyContent: "center", marginTop: 24 },
  successBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
