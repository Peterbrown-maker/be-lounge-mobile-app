import { ScreenHeader } from "@/src/components/ScreenHeader";
import { R, T } from "@/src/theme";
import { ChevronDown, ChevronRight, Mail, MessageCircle, Phone, Send } from "lucide-react-native";
import { useState } from "react";
import {
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

// TODO: replace ALL of these placeholders with Makhanani's real contact details.
const CONTACT = {
  phone: "+27 12 345 6789",
  whatsapp: "27123456789", // international format, no +
  email: "hello@example.com",
};

const FAQ = [
  {
    q: "How long does delivery take?",
    a: "Usually 25–40 minutes depending on how busy the kitchen is and how far you are.",
  },
  {
    q: "Can I book a table for a group?",
    a: "Yes — choose Sit-in at checkout and pick your time and party size. For 10+ people, give us a call.",
  },
  {
    q: "Where do you deliver to?",
    a: "We deliver to your current location within our delivery area.",
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
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const channels = [
    {
      Icon: MessageCircle,
      title: "WhatsApp us",
      hint: "Fastest — usually replies in minutes",
      onPress: () => open(`https://wa.me/${CONTACT.whatsapp}`, "WhatsApp isn't available on this device."),
    },
    {
      Icon: Phone,
      title: "Call Makhanani",
      hint: CONTACT.phone,
      onPress: () => open(`tel:${CONTACT.phone.replace(/\s/g, "")}`, `Call us on ${CONTACT.phone}`),
    },
    {
      Icon: Mail,
      title: "Email",
      hint: CONTACT.email,
      onPress: () => open(`mailto:${CONTACT.email}`, `Email us at ${CONTACT.email}`),
    },
  ];

  const sendMessage = () => {
    if (!message.trim()) return;
    const url = `mailto:${CONTACT.email}?subject=${encodeURIComponent("App support")}&body=${encodeURIComponent(message.trim())}`;
    open(url, `Email us at ${CONTACT.email}`).then(() => setMessage(""));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader title="Help & support" subtitle="We're here till the fire goes out" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.group}>
          {channels.map(({ Icon, title, hint, onPress }, i) => (
            <TouchableOpacity
              key={title}
              style={[styles.row, i < channels.length - 1 && styles.rowDivider]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, i === 0 && { backgroundColor: T.ember }]}>
                <Icon size={18} color={i === 0 ? "#000" : T.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowHint}>{hint}</Text>
              </View>
              <ChevronRight size={18} color={T.placeholder} />
            </TouchableOpacity>
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

        <Text style={styles.sectionTitle}>Send us a message</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Tell us what happened with your order…"
          placeholderTextColor={T.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.send, !message.trim() && { backgroundColor: T.surface }]}
          onPress={sendMessage}
          disabled={!message.trim()}
          activeOpacity={0.85}
        >
          <Send size={16} color={message.trim() ? "#FFF" : T.muted} />
          <Text style={[styles.sendText, !message.trim() && { color: T.muted }]}>Send message</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  textarea: {
    minHeight: 120,
    borderRadius: R.md,
    backgroundColor: T.surface,
    padding: 14,
    fontSize: 15,
    color: T.text,
  },
  send: {
    marginTop: 12,
    height: 52,
    borderRadius: R.lg,
    backgroundColor: T.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
});
