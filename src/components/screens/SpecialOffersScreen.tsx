import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");
const SIDE = 16;
const GAP = 12;
const CARD_WIDTH = screenWidth - SIDE * 2;
const CARD_HEIGHT = 216;
const SNAP = CARD_WIDTH + GAP;

// Matches the Home screen's light palette; offer cards stay black (Briano's brand).
const C = {
  text: "#0A0A0A",
  muted: "#737373",
  surface: "#F5F5F5",
  border: "#E5E5E5",
  ember: "#FF6B1A",
  onCard: "#FFFFFF",
  cardBorder: "#1F1F1F",
};

interface SpecialOffer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  emoji: string;
  discount: string;
  validOn: string;
  color: string;
  bgGradient: [string, string];
  features: string[];
}

interface SpecialOffersCarouselProps {
  onOfferPress?: (offer: SpecialOffer) => void;
}

const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: "sunday-meals",
    title: "Sunday Feast",
    subtitle: "Live Music & Entertainment",
    description: "Experience live band performances while enjoying family meals",
    image: "🎸",
    emoji: "🎵",
    discount: "UP TO 30% OFF",
    validOn: "Every Sunday",
    color: "#000000",
    bgGradient: ["#000000", "#171717"],
    features: [
      "Live band performances",
      "Family-style platters",
      "Outdoor seating available",
      "Reserved tables available",
    ],
  },
  {
    id: "market-day",
    title: "Market Day Special",
    subtitle: "Fresh & Local Ingredients",
    description: "Saturday market day specials with fresh local produce",
    image: "🌾",
    emoji: "🛒",
    discount: "20% OFF PLATTERS",
    validOn: "Every Saturday",
    color: "#000000",
    bgGradient: ["#000000", "#000000"],
    features: [
      "Fresh local produce",
      "Special market menu",
      "Limited quantities",
      "Early bird specials",
    ],
  },
  {
    id: "monday-quiz",
    title: "Monday Night Out",
    subtitle: "Quiz Game & Bingo",
    description: "Join us for quiz nights and bingo games with amazing prizes",
    image: "🎯",
    emoji: "🎲",
    discount: "PLAY & WIN",
    validOn: "Every Monday",
    color: "#000000",
    bgGradient: ["#000000", "#171717"],
    features: [
      "Team quiz competitions",
      "Bingo games with prizes",
      "Complimentary drinks",
      "Book your table now",
    ],
  },
  {
    id: "weekend-brunch",
    title: "Weekend Brunch",
    subtitle: "Morning to Afternoon Vibes",
    description: "Delicious breakfast & lunch combos with coffee",
    image: "☕",
    emoji: "🥞",
    discount: "BUY 2 GET 1",
    validOn: "Sat & Sunday 10am-3pm",
    color: "#262626",
    bgGradient: ["#262626", "#171717"],
    features: [
      "All-day brunch menu",
      "Specialty coffees",
      "Pastries & baked goods",
      "Family packages available",
    ],
  },
  {
    id: "happy-hour",
    title: "Happy Hour Special",
    subtitle: "Weekday Evening Deals",
    description: "Great drinks and appetizers at unbeatable prices",
    image: "🍹",
    emoji: "🎉",
    discount: "50% OFF DRINKS",
    validOn: "Monday-Friday 5-7pm",
    color: "#000000",
    bgGradient: ["#000000", "#171717"],
    features: [
      "Discounted beverages",
      "Appetizer combos",
      "Networking friendly",
      "Limited time offer",
    ],
  },
];

export const SpecialOffersCarousel: React.FC<SpecialOffersCarouselProps> = ({ onOfferPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SpecialOffer>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const last = SPECIAL_OFFERS.length - 1;

  const goTo = (index: number) => {
    const i = Math.max(0, Math.min(last, index));
    flatListRef.current?.scrollToOffset({ offset: i * SNAP, animated: true });
    setCurrentIndex(i);
  };

  // Auto-slide every 5s; restarts after any manual change.
  useEffect(() => {
    const t = setTimeout(() => goTo(currentIndex === last ? 0 : currentIndex + 1), 5000);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const renderOffer = ({ item, index }: { item: SpecialOffer; index: number }) => {
    const inputRange = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: "clamp" });

    return (
      <Animated.View
        style={[styles.cardContainer, { transform: [{ scale }], marginRight: index === last ? 0 : GAP }]}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={() => onOfferPress?.(item)} style={{ flex: 1 }}>
          <LinearGradient
            colors={["#1F1F1F", "#0B0B0B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Ember glow in the corner */}
            <View style={styles.glow} />

            {/* Content is centred in the card */}
            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <View style={styles.emojiBox}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discount}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.validOnText} numberOfLines={1}>🗓  {item.validOn}</Text>
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaButtonText}>Explore deal</Text>
                  <ChevronRight size={14} color="#000" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header — arrows live here so they never cover card content */}
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Special Offers</Text>
          <Text style={styles.headerSubtitle}>Limited time deals</Text>
        </View>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navDisabled]}
          onPress={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          accessibilityLabel="Previous offer"
        >
          <ChevronLeft size={20} color={C.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === last && styles.navDisabled]}
          onPress={() => goTo(currentIndex + 1)}
          disabled={currentIndex === last}
          accessibilityLabel="Next offer"
        >
          <ChevronRight size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SPECIAL_OFFERS}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / SNAP))}
        contentContainerStyle={{ paddingHorizontal: SIDE }}
        style={{ height: CARD_HEIGHT }}
      />

      <View style={styles.dotsContainer}>
        {SPECIAL_OFFERS.map((offer, index) => (
          <TouchableOpacity
            key={offer.id}
            onPress={() => goTo(index)}
            hitSlop={8}
            style={[
              styles.dot,
              index === currentIndex
                ? { backgroundColor: C.ember, width: 22 }
                : { backgroundColor: "#D4D4D4", width: 8 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export const SpecialOffersSection: React.FC<{
  onOfferPress?: (offer: SpecialOffer) => void;
}> = ({ onOfferPress }) => (
  <View style={styles.section}>
    <SpecialOffersCarousel onOfferPress={onOfferPress} />
  </View>
);

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  section: { flex: 1 },

  headerContainer: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: SIDE, marginBottom: 12 },
  headerTitle: { color: C.text, fontSize: 18, fontWeight: "700" },
  headerSubtitle: { color: C.muted, fontSize: 13, marginTop: 2 },
  navButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center",
  },
  navDisabled: { opacity: 0.35 },

  cardContainer: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 20, overflow: "hidden" },
  card: {
    flex: 1, borderRadius: 20, borderWidth: 1, borderColor: C.cardBorder,
    paddingHorizontal: 18, justifyContent: "center", // vertical centring
  },
  glow: {
    position: "absolute", top: -60, right: -60, width: 180, height: 180,
    borderRadius: 90, backgroundColor: "rgba(255,107,26,0.18)",
  },
  cardBody: { gap: 4 },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  emojiBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  discountBadge: { backgroundColor: C.ember, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  discountText: { color: "#000", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  cardTitle: { color: C.onCard, fontSize: 22, fontWeight: "800" },
  cardSubtitle: { color: C.ember, fontSize: 13, fontWeight: "600" },
  cardDescription: { color: "#D4D4D4", fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10 },
  validOnText: { color: C.muted, fontSize: 12, flexShrink: 1 },
  ctaButton: {
    flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: C.onCard,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  ctaButtonText: { color: "#000", fontSize: 12, fontWeight: "700" },

  dotsContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 12 },
  dot: { height: 8, borderRadius: 4 },
});
