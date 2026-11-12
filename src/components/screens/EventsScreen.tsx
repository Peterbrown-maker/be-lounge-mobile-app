import { ScreenHeader } from "@/src/components/ScreenHeader";
import {
  MacnoseEvent,
  eventBadge,
  formatEntry,
  formatEventWhen,
  isTonight,
  upcomingEvents,
} from "@/src/data/macnoseEvents";
import { MACNOSE_RESTAURANT } from "@/src/services/restaurants";
import { useEventReminder } from "@/src/services/notifications";
import { R, T } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, BellRing, CalendarDays, Check, Clock, MapPin, Music2, Ticket } from "lucide-react-native";
import { useEffect, useState } from "react";
import { BackHandler, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EventsScreenProps {
  onBack: () => void;
  /** Open straight on this event's details. */
  initialEventId?: string | null;
  /** Go to checkout as a sit-in booking for this event. */
  onBookTable: (event: MacnoseEvent) => void;
}

export const EventsScreen = ({ onBack, initialEventId, onBookTable }: EventsScreenProps) => {
  const events = upcomingEvents();
  const [selectedId, setSelectedId] = useState<string | null>(initialEventId ?? null);
  const selected = events.find((e) => e.id === selectedId);
  // Opened straight on an event: back leaves the screen. Opened from the list: back returns to it.
  const closeDetail = () => (initialEventId ? onBack() : setSelectedId(null));

  // Android hardware back mirrors the on-screen back arrow.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selected) closeDetail();
      else onBack();
      return true;
    });
    return () => sub.remove();
  }, [selected, initialEventId, onBack]);

  if (selected) {
    return (
      <EventDetail
        event={selected}
        onBack={closeDetail}
        onBookTable={() => onBookTable(selected)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="What's on" subtitle="Live at Be Lounge" onBack={onBack} />
      {events.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Music2 size={28} color={T.muted} />
          </View>
          <Text style={styles.emptyTitle}>No events right now</Text>
          <Text style={styles.emptyText}>New line-ups are announced in your notifications.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {events.map((e) => (
            <EventCard key={e.id} event={e} onPress={() => setSelectedId(e.id)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const EventCard = ({ event, onPress }: { event: MacnoseEvent; onPress: () => void }) => {
  const badge = eventBadge(event);
  const [reminded] = useEventReminder(event.id);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View>
        <Image source={event.image} style={styles.cardImage} />
        <View style={styles.badge}>
          <Text style={styles.badgeDow}>{badge.dow}</Text>
          <Text style={styles.badgeDay}>{badge.day}</Text>
          <Text style={styles.badgeMonth}>{badge.month}</Text>
        </View>
        {isTonight(event) && (
          <View style={styles.tonight}>
            <Text style={styles.tonightText}>TONIGHT</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardGenre}>{event.genre.toUpperCase()}</Text>
        <Text style={styles.cardTitle}>{event.artist}</Text>
        <Text style={styles.cardSub}>
          {event.title} · {event.startTime} – {event.endTime} · {formatEntry(event)}
        </Text>
        {reminded && (
          <View style={styles.remindedRow}>
            <BellRing size={13} color={T.emberText} />
            <Text style={styles.remindedText}>Reminder on</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EventDetail = ({
  event,
  onBack,
  onBookTable,
}: {
  event: MacnoseEvent;
  onBack: () => void;
  onBookTable: () => void;
}) => {
  const [reminded, toggleReminder] = useEventReminder(event.id);
  return (
    <View style={styles.container}>
      <ScreenHeader title={event.artist} subtitle={event.title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroWrap}>
          <Image source={event.image} style={styles.heroImage} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroText}>
            <Text style={styles.heroGenre}>{event.genre.toUpperCase()}</Text>
            <Text style={styles.heroTitle}>{event.artist}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.facts}>
            <Fact Icon={CalendarDays} text={formatEventWhen(event)} />
            <Fact Icon={Ticket} text={formatEntry(event)} />
            <Fact Icon={MapPin} text={`Be Lounge, ${MACNOSE_RESTAURANT.address}`} />
          </View>

          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.perks}>
            {event.perks.map((p) => (
              <View key={p} style={styles.perkRow}>
                <Check size={15} color={T.emberText} />
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.legal}>No alcohol sold to persons under 18. Drink responsibly.</Text>

          <TouchableOpacity style={styles.primary} onPress={onBookTable} activeOpacity={0.85}>
            <CalendarDays size={18} color="#FFF" />
            <Text style={styles.primaryText}>Book a table</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondary, reminded && styles.secondaryOn]}
            onPress={toggleReminder}
            activeOpacity={0.85}
            accessibilityState={{ selected: reminded }}
          >
            {reminded ? <BellRing size={18} color={T.emberText} /> : <Bell size={18} color={T.text} />}
            <Text style={[styles.secondaryText, reminded && { color: T.emberText }]}>
              {reminded ? "Reminder on · tap to cancel" : "Remind me"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const Fact = ({ Icon, text }: { Icon: typeof Clock; text: string }) => (
  <View style={styles.factRow}>
    <Icon size={16} color={T.muted} />
    <Text style={styles.factText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  list: { padding: 16, gap: 14, paddingBottom: 40 },

  card: { borderRadius: R.xl, overflow: "hidden", backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  cardImage: { width: "100%", aspectRatio: 16 / 9 },
  badge: {
    position: "absolute", top: 12, left: 12, width: 54, paddingVertical: 6, borderRadius: R.md,
    backgroundColor: T.bg, alignItems: "center",
  },
  badgeDow: { color: T.emberText, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  badgeDay: { color: T.text, fontSize: 20, fontWeight: "800", lineHeight: 24 },
  badgeMonth: { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  tonight: { position: "absolute", top: 12, right: 12, backgroundColor: T.ember, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tonightText: { color: "#FFF", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  cardBody: { padding: 14 },
  cardGenre: { color: T.emberText, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  cardTitle: { color: T.text, fontSize: 20, fontWeight: "800", marginTop: 2 },
  cardSub: { color: T.muted, fontSize: 13, marginTop: 4 },
  remindedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  remindedText: { color: T.emberText, fontSize: 12, fontWeight: "700" },

  heroWrap: { width: "100%", aspectRatio: 16 / 9, backgroundColor: T.surface },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroText: { position: "absolute", left: 16, right: 16, bottom: 14 },
  heroGenre: { color: "#FFF", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, opacity: 0.85 },
  heroTitle: { color: "#FFF", fontSize: 26, fontWeight: "800" },

  body: { padding: 16 },
  facts: { backgroundColor: T.surface, borderRadius: R.lg, padding: 14, gap: 10 },
  factRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  factText: { color: T.text, fontSize: 14, fontWeight: "600", flexShrink: 1 },
  description: { color: T.text, fontSize: 15, lineHeight: 22, marginTop: 16 },
  perks: { marginTop: 14, gap: 8 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkText: { color: T.text, fontSize: 14 },
  legal: { color: T.muted, fontSize: 12, marginTop: 16 },

  primary: {
    marginTop: 18, height: 56, borderRadius: R.lg, backgroundColor: T.ember,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  primaryText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  secondary: {
    marginTop: 10, height: 52, borderRadius: R.lg, backgroundColor: T.surface,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  secondaryOn: { backgroundColor: T.emberSoft },
  secondaryText: { color: T.text, fontSize: 15, fontWeight: "800" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.surface, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: T.text, fontSize: 18, fontWeight: "800" },
  emptyText: { color: T.muted, fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
