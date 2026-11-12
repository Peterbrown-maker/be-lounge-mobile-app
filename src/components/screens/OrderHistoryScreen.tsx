import { ScreenHeader } from "@/src/components/ScreenHeader";
import { ALL_MENU_ITEMS } from "@/src/data/macnoseMenu";
import { Order, ordersApiService } from "@/src/services/orders";
import { R, T } from "@/src/theme";
import { CalendarDays, ChevronRight, ClipboardList, ShoppingBag, X, Zap } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OrderHistoryScreenProps {
  onBack: () => void;
  onTrackOrder?: (orderId: string) => void;
}

type Kind = "delivery" | "takeaway" | "sitin";

const kindOf = (o: Order): Kind =>
  o.delivery_address?.startsWith("Table for") ? "sitin" : o.delivery_address?.startsWith("Collect at") ? "takeaway" : "delivery";

const KIND: Record<Kind, { label: string; Icon: typeof Zap }> = {
  delivery: { label: "Delivery", Icon: Zap },
  takeaway: { label: "Collect", Icon: ShoppingBag },
  sitin: { label: "Table", Icon: CalendarDays },
};

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Placed", color: T.emberText, bg: T.emberSoft },
  on_the_way: { label: "On the way", color: T.emberText, bg: T.emberSoft },
  delivered: { label: "Delivered", color: T.success, bg: T.successSoft },
  cancelled: { label: "Cancelled", color: T.danger, bg: T.dangerSoft },
};

const menuById = Object.fromEntries(ALL_MENU_ITEMS.map((m) => [m.id, m]));

const itemSummary = (o: Order) => {
  const names = (o.items || [])
    .map((i) => menuById[String(i.menu_item_id)]?.name)
    .filter(Boolean) as string[];
  if (!names.length) return kindOf(o) === "sitin" ? "Table booking" : "Order";
  return names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2} more` : names.join(", ");
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const OrderHistoryScreen = ({ onBack }: OrderHistoryScreenProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await ordersApiService.getUserOrders());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Order history"
        subtitle={orders.length ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : undefined}
        onBack={onBack}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.emberText} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <ClipboardList size={28} color={T.muted} />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your orders and table bookings will show up here.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => (setRefreshing(true), load())} />}
        >
          {orders.map((o) => {
            const kind = kindOf(o);
            const { Icon, label } = KIND[kind];
            const status = STATUS[o.status] || STATUS.pending;
            const firstImage = menuById[String(o.items?.[0]?.menu_item_id)]?.image;
            return (
              <TouchableOpacity key={o.id} style={styles.card} onPress={() => setSelected(o)} activeOpacity={0.8}>
                {firstImage ? (
                  <Image source={firstImage} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbIcon]}>
                    <Icon size={20} color={T.text} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTop}>
                    <View style={styles.kind}>
                      <Icon size={12} color={T.muted} />
                      <Text style={styles.kindText}>{label}</Text>
                    </View>
                    <View style={[styles.status, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.items} numberOfLines={1}>{itemSummary(o)}</Text>
                  <Text style={styles.meta}>
                    {formatDate(o.created_at)}
                    {o.total_amount >= 1 ? ` · R${o.total_amount.toFixed(2)}` : ""}
                  </Text>
                </View>
                <ChevronRight size={18} color={T.placeholder} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Details */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          {selected && (
            <Pressable style={styles.sheet}>
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>Order #{String(selected.id).slice(-6)}</Text>
                <TouchableOpacity onPress={() => setSelected(null)} hitSlop={8} accessibilityLabel="Close">
                  <X size={22} color={T.muted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.meta}>{formatDate(selected.created_at)} · {KIND[kindOf(selected)].label}</Text>

              {kindOf(selected) === "delivery" && !!selected.delivery_code && (
                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>Delivery code</Text>
                  <Text style={styles.code}>{selected.delivery_code}</Text>
                </View>
              )}

              <View style={styles.detailCard}>
                {(selected.items || []).map((i, idx) => {
                  const m = menuById[String(i.menu_item_id)];
                  return (
                    <View key={idx} style={styles.detailRow}>
                      <Text style={styles.detailName} numberOfLines={1}>
                        {i.quantity} × {m?.name || "Table booking"}
                      </Text>
                      <Text style={styles.detailPrice}>{i.price ? `R${(i.price * i.quantity).toFixed(2)}` : ""}</Text>
                    </View>
                  );
                })}
                {selected.delivery_fee > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailMuted}>Delivery fee</Text>
                    <Text style={styles.detailMuted}>R{selected.delivery_fee.toFixed(2)}</Text>
                  </View>
                )}
                {selected.total_amount >= 1 && (
                  <View style={[styles.detailRow, styles.detailTotal]}>
                    <Text style={styles.detailTotalText}>Total</Text>
                    <Text style={styles.detailTotalText}>R{selected.total_amount.toFixed(2)}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.address}>{selected.delivery_address}</Text>
              {!!selected.special_instructions && (
                <Text style={styles.address}>Note: {selected.special_instructions}</Text>
              )}
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.surface, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: T.text, fontSize: 18, fontWeight: "800" },
  emptyText: { color: T.muted, fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20 },

  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.lg, backgroundColor: T.surface },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  thumbIcon: { backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  kind: { flexDirection: "row", alignItems: "center", gap: 4 },
  kindText: { color: T.muted, fontSize: 12, fontWeight: "700" },
  status: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill },
  statusText: { fontSize: 11, fontWeight: "800" },
  items: { color: T.text, fontSize: 15, fontWeight: "700", marginTop: 4 },
  meta: { color: T.muted, fontSize: 12, marginTop: 2 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: T.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { color: T.text, fontSize: 20, fontWeight: "800" },
  codeCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: 14, borderRadius: R.lg, backgroundColor: T.text },
  codeLabel: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  code: { color: T.ember, fontSize: 24, fontWeight: "900", letterSpacing: 4 },
  detailCard: { marginTop: 14, padding: 14, borderRadius: R.lg, backgroundColor: T.surface },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 5 },
  detailName: { color: T.text, fontSize: 14, fontWeight: "600", flex: 1 },
  detailPrice: { color: T.text, fontSize: 14, fontWeight: "700" },
  detailMuted: { color: T.muted, fontSize: 14 },
  detailTotal: { borderTopWidth: 1, borderTopColor: T.border, marginTop: 6, paddingTop: 10 },
  detailTotalText: { color: T.text, fontSize: 16, fontWeight: "800" },
  address: { color: T.muted, fontSize: 13, marginTop: 12, lineHeight: 19 },
});
