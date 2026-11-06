import { ArrowLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { T } from "../theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

/** Standard screen header: round back button, bold title, optional right slot. */
export const ScreenHeader = ({ title, subtitle, onBack, right }: ScreenHeaderProps) => (
  <View style={styles.header}>
    <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.back} accessibilityLabel="Go back" hitSlop={8}>
        <ArrowLeft size={20} color={T.text} />
      </TouchableOpacity>
    ) : (
      <View style={styles.spacer} />
    )}
    <View style={styles.titles}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
    </View>
    <View style={styles.right}>{right}</View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: T.bg,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: { width: 0 },
  titles: { flex: 1 },
  title: { color: T.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { color: T.muted, fontSize: 13, marginTop: 1 },
  right: { minWidth: 42, alignItems: "flex-end" },
});

export default ScreenHeader;
