import { ScreenHeader } from "@/src/components/ScreenHeader";
import { R, T } from "@/src/theme";
import { Bell, Flame, Music2, Package, Truck } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NotificationScreenProps {
  onBack: () => void;
}

type Kind = "order" | "delivery" | "event" | "deal";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  kind: Kind;
  read: boolean;
}

// Prototype content.
const SAMPLE: Notification[] = [
  { id: "1", kind: "order", title: "Your order is on the fire", message: "Head, Feet & Pap is cooking, about 20 minutes.", time: "30 min ago", read: false },
  { id: "2", kind: "delivery", title: "Driver on the way", message: "Sipho is 8 minutes away with your Makhanani order.", time: "2 days ago", read: true },
  { id: "3", kind: "event", title: "Welcome to Makhanani", message: "Head meats, paps and good vibes. Book a table and pull through.", time: "3 days ago", read: true },
];

const ICONS: Record<Kind, typeof Bell> = { order: Flame, delivery: Truck, event: Music2, deal: Package };

export const NotificationScreen = ({ onBack }: NotificationScreenProps) => {
  const [items, setItems] = useState(SAMPLE);
  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        subtitle={unread ? `${unread} new` : "You're all caught up"}
        onBack={onBack}
        right={
          unread ? (
            <TouchableOpacity onPress={markAll} hitSlop={8}>
              <Text style={styles.markAll}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Bell size={28} color={T.muted} />
          </View>
          <Text style={styles.emptyTitle}>Nothing yet</Text>
          <Text style={styles.emptyText}>Order updates and this week's line-up will show up here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {items.map((n) => {
            const Icon = ICONS[n.kind];
            const highlight = n.kind === "event" || n.kind === "deal";
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.item, !n.read && styles.itemUnread]}
                onPress={() => markRead(n.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: n.read ? T.surface : T.bg },
                    highlight && { backgroundColor: T.emberSoft },
                  ]}
                >
                  <Icon size={18} color={highlight ? T.emberText : T.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, !n.read && { fontWeight: "800" }]} numberOfLines={1}>{n.title}</Text>
                    {!n.read && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.message}>{n.message}</Text>
                  <Text style={styles.time}>{n.time}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  markAll: { color: T.emberText, fontSize: 13, fontWeight: "800" },
  item: { flexDirection: "row", gap: 12, padding: 14, borderRadius: R.lg, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border },
  itemUnread: { backgroundColor: T.surface, borderColor: T.surface },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, color: T.text, fontSize: 15, fontWeight: "600" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.ember },
  message: { color: T.muted, fontSize: 13, lineHeight: 19, marginTop: 3 },
  time: { color: T.placeholder, fontSize: 12, marginTop: 6 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.surface, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: T.text, fontSize: 18, fontWeight: "800" },
  emptyText: { color: T.muted, fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
