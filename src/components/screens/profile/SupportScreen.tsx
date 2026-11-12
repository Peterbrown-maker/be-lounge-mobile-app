import { ScreenHeader } from "@/src/components/ScreenHeader";
import { MACNOSE_INFO, MACNOSE_RESTAURANT } from "@/src/services/restaurants";
import { R, T } from "@/src/theme";
import { ChevronDown, ChevronRight, Clock, MapPin } from "lucide-react-native";
import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FAQ = [
  {
    q: "When is Mogodu Monday?",
    a: "Our traditional meals (mogodu, tlhogo, tlhakwana, chicken feet, masonja, skop and marapo) are served on Mondays. Ask your waitron for today's selection.",
  },
  {
    q: "What are your opening hours?",
    a: MACNOSE_INFO.hours.map((h) => `${h.days}: ${h.time}`).join("\n"),
  },
  {
    q: "I have an allergy or I'm in a hurry",
    a: MACNOSE_INFO.promise,
  },
  {
    q: "Do you deliver drinks?",
    a: "Alcohol is only sold to persons 18 and older, and ID may be checked on delivery or collection. Drink responsibly.",
  },
  {
    q: "Where are you?",
    a: `${MACNOSE_RESTAURANT.address}. Tap "Get directions" above to open it on the map.`,
  },
];

interface SupportScreenProps {
  onBack: () => void;
}

const open = async (url: string, fallback: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Couldn't open", fallback);
  }
};

export const SupportScreen = ({ onBack }: SupportScreenProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { latitude, longitude, address } = MACNOSE_RESTAURANT;

  const channels = [
    {
      Icon: MapPin,
      title: "Get directions",
      hint: address,
      onPress: () =>
        open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, address),
    },
    // Add Be Lounge's Instagram / Facebook / website here once available.
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Help & support" subtitle="Good memories are made here" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.group}>
          {channels.map(({ Icon, title, hint, onPress }, i) => (
            <TouchableOpacity
              key={title}
              style={[styles.row, i < channels.length - 1 && styles.rowDivider]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, i === 0 && { backgroundColor: T.ember }]}>
                <Icon size={18} color={i === 0 ? T.onDark : T.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowHint}>{hint}</Text>
              </View>
              <ChevronRight size={18} color={T.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Opening hours</Text>
        <View style={styles.group}>
          {MACNOSE_INFO.hours.map((h, i) => (
            <View key={h.days} style={[styles.row, i < MACNOSE_INFO.hours.length - 1 && styles.rowDivider]}>
              <Clock size={16} color={T.muted} />
              <Text style={[styles.rowTitle, { flex: 1 }]}>{h.days}</Text>
              <Text style={styles.hoursTime}>{h.time}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Common questions</Text>
        <View style={styles.group}>
          {FAQ.map((item, i) => {
            const expanded = openFaq === i;
            return (
              <TouchableOpacity
                key={item.q}
                style={[styles.faq, i < FAQ.length - 1 && styles.rowDivider]}
                onPress={() => setOpenFaq(expanded ? null : i)}
                activeOpacity={0.7}
                accessibilityState={{ expanded }}
              >
                <View style={styles.faqHead}>
                  <Text style={styles.faqQ}>{item.q}</Text>
                  {expanded ? <ChevronDown size={18} color={T.text} /> : <ChevronRight size={18} color={T.placeholder} />}
                </View>
                {expanded && <Text style={styles.faqA}>{item.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: T.muted, fontSize: 12, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 24, marginBottom: 8, marginLeft: 4 },
  group: { backgroundColor: T.surface, borderRadius: R.lg },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: T.border },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  rowTitle: { color: T.text, fontSize: 15, fontWeight: "700" },
  rowHint: { color: T.muted, fontSize: 12, marginTop: 1 },
  faq: { paddingHorizontal: 14, paddingVertical: 14 },
  faqHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  faqQ: { flex: 1, color: T.text, fontSize: 15, fontWeight: "700" },
  faqA: { color: T.muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
  hoursTime: { color: T.muted, fontSize: 14, fontWeight: "600" },
});
