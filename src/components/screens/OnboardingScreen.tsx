import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, CalendarDays, Flame, LocateFixed, ShoppingBag, Utensils, Zap } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const C = {
  bg: "#FFFFFF",
  surface: "#F5F5F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  muted: "#737373",
  ember: "#FF6B1A",
  emberText: "#C2410C",
  emberSoft: "rgba(255,107,26,0.12)",
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface Chip {
  label: string;
  Icon: typeof Zap;
}

interface Slide {
  kicker: string;
  title: string;
  description: string;
  image: any;
  KickerIcon: typeof Zap;
  chips: Chip[];
}

const SLIDES: Slide[] = [
  {
    kicker: "HEAD MEATS",
    KickerIcon: Flame,
    title: "Cow, pig and\nsheep heads",
    description: "Head meats cooked to perfection, the way a proper shisanyama does it.",
    image: require("../../assets/makhanani/head_plate.jpg"),
    chips: [
      { label: "Head meats", Icon: Flame },
      { label: "Feet", Icon: Utensils },
    ],
  },
  {
    kicker: "PAPS",
    KickerIcon: Utensils,
    title: "Pap, feet\nand gravy",
    description: "Soft white pap and feet in rich gravy. Book a table and pull through for the good vibes.",
    image: require("../../assets/makhanani/feet_and_pap.jpg"),
    chips: [
      { label: "Pap & gravy", Icon: Utensils },
      { label: "Book a table", Icon: CalendarDays },
    ],
  },
  {
    kicker: "DELIVERY",
    KickerIcon: LocateFixed,
    title: "Delivered to\nwhere you are",
    description: "We use your live location, so there's no address to type. Or collect it, or eat in with the squad.",
    image: require("../../assets/makhanani/full_plate.jpg"),
    chips: [
      { label: "Delivery", Icon: Zap },
      { label: "Collect", Icon: ShoppingBag },
      { label: "Sit-in", Icon: Utensils },
    ],
  },
];

const IMAGE_HEIGHT = Math.min(height * 0.48, 440);

export const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isLast = index === SLIDES.length - 1;

  const next = () => {
    if (isLast) return onComplete();
    listRef.current?.scrollToOffset({ offset: (index + 1) * width, animated: true });
    setIndex(index + 1);
  };

  const renderSlide = ({ item, index: i }: { item: Slide; index: number }) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
    const imageScale = scrollX.interpolate({ inputRange, outputRange: [1.12, 1, 1.12], extrapolate: "clamp" });
    const textShift = scrollX.interpolate({ inputRange, outputRange: [40, 0, -40], extrapolate: "clamp" });
    const textOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: "clamp" });

    return (
      <View style={styles.slide}>
        <View style={styles.imageCard}>
          <Animated.Image source={item.image} style={[styles.image, { transform: [{ scale: imageScale }] }]} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.55)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.chipRow}>
            {item.chips.map(({ label, Icon }) => (
              <View key={label} style={styles.chip}>
                <Icon size={14} color={C.text} />
                <Text style={styles.chipText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Animated.View style={[styles.textBlock, { opacity: textOpacity, transform: [{ translateX: textShift }] }]}>
          <View style={styles.kicker}>
            <item.KickerIcon size={14} color={C.emberText} />
            <Text style={styles.kickerText}>{item.kicker}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <View style={styles.logoTile}>
          <Image source={require("../../assets/makhanani/wordmark.png")} style={styles.logo} resizeMode="contain" />
        </View>
        {!isLast && (
          <TouchableOpacity onPress={onComplete} hitSlop={10} accessibilityLabel="Skip introduction">
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(s) => s.kicker}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        // JS driver: the progress dots animate `width`, which the native driver can't do.
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => {
            const w = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 26, 8],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={s.kicker}
                style={[styles.dot, { width: w, backgroundColor: i === index ? C.ember : C.border }]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={next}
          activeOpacity={0.85}
          style={[styles.cta, isLast && { backgroundColor: C.ember }]}
          accessibilityLabel={isLast ? "Get started" : "Next"}
        >
          <Text style={[styles.ctaText, isLast && { color: "#000" }]}>{isLast ? "Let's get started" : "Next"}</Text>
          <ArrowRight size={18} color={isLast ? "#000" : "#FFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 52,
  },
  logoTile: { backgroundColor: "#000000", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  logo: { width: 118, height: 40 },
  skip: { color: C.muted, fontSize: 15, fontWeight: "600" },

  slide: { width, paddingHorizontal: 20 },
  imageCard: {
    height: IMAGE_HEIGHT,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  chipRow: { position: "absolute", left: 14, right: 14, bottom: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipText: { color: C.text, fontSize: 13, fontWeight: "700" },

  textBlock: { paddingTop: 24, paddingHorizontal: 4 },
  kicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: C.emberSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },
  kickerText: { color: C.emberText, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: C.text, fontSize: 32, fontWeight: "800", lineHeight: 38, letterSpacing: -0.5 },
  description: { color: C.muted, fontSize: 16, lineHeight: 24, marginTop: 10 },

  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8, gap: 18 },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
  cta: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
