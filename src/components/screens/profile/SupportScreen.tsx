import { ArrowLeft, HelpCircle, Mail, MessageCircle, Phone, Send } from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface SupportScreenProps {
  onBack: () => void;
}

export const SupportScreen = ({ onBack }: SupportScreenProps) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [message, setMessage] = useState("");

  const bg = isDark ? "#05070A" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111827";
  const subtitleText = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#1F2937" : "#F9FAFB";
  const inputBg = isDark ? "#0F172A" : "#F3F4F6";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const accentColor = isDark ? "#4F46E5" : "#2563EB";

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      subtitle: "Chat with our support team",
      action: () => Alert.alert("Live Chat", "Live chat would be opened here."),
    },
    {
      icon: Phone,
      title: "Call Support",
      subtitle: "+27 21 123 4567",
      action: () => Alert.alert("Call Support", "Dialing support number..."),
    },
    {
      icon: Mail,
      title: "Email Support",
      subtitle: "support@flavorhosdeliveries.com",
      action: () => Alert.alert("Email Support", "Email client would open here."),
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      subtitle: "Frequently asked questions",
      action: () => Alert.alert("FAQ", "FAQ section would open here."),
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      Alert.alert("Message Sent", "Thank you for your message. We'll get back to you soon!", [
        { text: "OK", onPress: () => setMessage("") }
      ]);
    } else {
      Alert.alert("Error", "Please enter a message.");
    }
  };

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
        <Text style={[styles.headerTitle, { color: text }]}>Support</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Support Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Get Help</Text>
          {supportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.supportOption, { backgroundColor: cardBg }]}
              onPress={option.action}
            >
              <View style={styles.optionLeft}>
                <option.icon size={24} color={accentColor} />
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: text }]}>{option.title}</Text>
                  <Text style={[styles.optionSubtitle, { color: subtitleText }]}>{option.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Send us a Message</Text>
          <View style={[styles.messageContainer, { backgroundColor: cardBg }]}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question..."
              placeholderTextColor={subtitleText}
              style={[styles.messageInput, { color: text }]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: accentColor }]}
              onPress={handleSendMessage}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Response Time Info */}
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.infoTitle, { color: text }]}>Response Time</Text>
          <Text style={[styles.infoText, { color: subtitleText }]}>
            We typically respond to support requests within 24 hours during business days.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  supportOption: { padding: 16, borderRadius: 12, marginBottom: 8 },
  optionLeft: { flexDirection: "row", alignItems: "center" },
  optionText: { marginLeft: 12 },
  optionTitle: { fontSize: 16, fontWeight: "500" },
  optionSubtitle: { fontSize: 14, marginTop: 2 },
  messageContainer: { borderRadius: 12, padding: 16 },
  messageInput: { fontSize: 16, minHeight: 100, marginBottom: 12 },
  sendButton: { alignSelf: "flex-end", padding: 12, borderRadius: 24 },
  infoCard: { padding: 16, borderRadius: 12 },
  infoTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
});
