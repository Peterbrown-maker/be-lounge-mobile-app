import { ArrowLeft, Bell, Clock, Package, Truck } from "lucide-react-native";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface NotificationScreenProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "order" | "delivery" | "promo" | "system";
  read: boolean;
}

export const NotificationScreen = ({ onBack }: NotificationScreenProps) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "🎉 Sunday Feast is Live!",
      message: "Join us for live band performances and family meals with 30% off!",
      time: "Just now",
      type: "promo",
      read: false,
    },
    {
      id: "2",
      title: "📍 Order Ready for Pickup",
      message: "Your Flavor Chicken Prego order is ready! Come collect it now.",
      time: "30 mins ago",
      type: "order",
      read: false,
    },
    {
      id: "3",
      title: "🎯 Monday Quiz Night",
      message: "Quiz night is on! Book your table and compete for amazing prizes.",
      time: "1 day ago",
      type: "promo",
      read: false,
    },
    {
      id: "4",
      title: "🚗 Driver on the Way",
      message: "Sipho is 8 minutes away with your Flavor Hospitality order.",
      time: "2 days ago",
      type: "delivery",
      read: true,
    },
    {
      id: "5",
      title: "💚 Market Day Specials",
      message: "Saturday market day is here! Fresh produce and 20% off platters.",
      time: "3 days ago",
      type: "promo",
      read: true,
    },
  ]);

  const bg = isDark ? "#05070A" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111827";
  const subtitleText = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#1F2937" : "#F9FAFB";
  const accentColor = "#F59E0B";
  const unreadBg = isDark ? "#374151" : "#EFF6FF";

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return Package;
      case "delivery":
        return Truck;
      case "promo":
        return Bell;
      case "system":
        return Clock;
      default:
        return Bell;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        <Text style={[styles.headerTitle, { color: text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: accentColor }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color={subtitleText} />
            <Text style={[styles.emptyTitle, { color: text }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtitle, { color: subtitleText }]}>
              We'll notify you when there are updates on your orders and promotions.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const IconComponent = getIcon(notification.type);
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  { backgroundColor: notification.read ? cardBg : unreadBg }
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                <View style={styles.notificationLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
                    <IconComponent size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, { color: text }]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: subtitleText }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: subtitleText }]}>
                      {notification.time}
                    </Text>
                  </View>
                </View>
                {!notification.read && (
                  <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    paddingRight: 60,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", flex: 1 },
  badge: {
    position: "absolute",
    right: 16,
    top: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 64 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  notificationLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  notificationMessage: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  notificationTime: { fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
