import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth - 48;

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
    color: "#DC2626",
    bgGradient: ["#DC2626", "#991B1B"],
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
    color: "#EA580C",
    bgGradient: ["#EA580C", "#C2410C"],
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
    color: "#2E7D32",
    bgGradient: ["#2E7D32", "#1B5E20"],
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
    color: "#1E40AF",
    bgGradient: ["#1E40AF", "#1E3A8A"],
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
    color: "#7C3AED",
    bgGradient: ["#7C3AED", "#5B21B6"],
    features: [
      "Discounted beverages",
      "Appetizer combos",
      "Networking friendly",
      "Limited time offer",
    ],
  },
];

export const SpecialOffersCarousel: React.FC<SpecialOffersCarouselProps> = ({
  onOfferPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";

  // Auto-slide effect
  useEffect(() => {
    const autoSlideInterval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % SPECIAL_OFFERS.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(autoSlideInterval);
  }, [currentIndex]);

  const renderOffer = ({ item, index }: { item: SpecialOffer; index: number }) => {
    const inputRange = [(index - 1) * CARD_WIDTH, index * CARD_WIDTH, (index + 1) * CARD_WIDTH];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onOfferPress?.(item)}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={item.bgGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Header with emoji and discount */}
            <View style={styles.cardHeader}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}</Text>
              </View>
            </View>

            {/* Title and subtitle */}
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>

            {/* Description */}
            <Text style={styles.cardDescription}>{item.description}</Text>

            {/* Valid on */}
            <View style={styles.validOnContainer}>
              <Text style={styles.validOnLabel}>Valid:</Text>
              <Text style={styles.validOnText}>{item.validOn}</Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {item.features.slice(0, 2).map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => onOfferPress?.(item)}
            >
              <Text style={styles.ctaButtonText}>Explore Deal</Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleNext = () => {
    if (currentIndex < SPECIAL_OFFERS.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const dotContainerStyle = {
    backgroundColor: isDark ? "#333" : "#f0f0f0",
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Special Offers
          </Text>
          <Text style={[styles.headerSubtitle, { color: "#888" }]}>
            Limited time deals
          </Text>
        </View>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        {/* Left Navigation Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonLeft,
            { opacity: currentIndex === 0 ? 0.3 : 1 },
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} color="#F59E0B" />
        </TouchableOpacity>

        {/* Carousel FlatList */}
        <FlatList
          ref={flatListRef}
          data={SPECIAL_OFFERS}
          renderItem={renderOffer}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={32}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(contentOffsetX / CARD_WIDTH);
            setCurrentIndex(newIndex);
          }}
          contentContainerStyle={styles.carouselContent}
        />

        {/* Right Navigation Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonRight,
            { opacity: currentIndex === SPECIAL_OFFERS.length - 1 ? 0.3 : 1 },
          ]}
          onPress={handleNext}
          disabled={currentIndex === SPECIAL_OFFERS.length - 1}
        >
          <ChevronRight size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      {/* Dots Indicator */}
      <View style={[styles.dotsContainer, dotContainerStyle]}>
        {SPECIAL_OFFERS.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? "#F59E0B" : "#ccc",
                width: index === currentIndex ? 24 : 8,
              },
            ]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
              });
              setCurrentIndex(index);
            }}
          />
        ))}
      </View>

      {/* Quick Info */}
      <View style={[styles.quickInfo, { backgroundColor: isDark ? "#222" : "#f9f9f9" }]}>
        <Text style={[styles.quickInfoText, { color: "#888" }]}>
          💡 Tap any offer to learn more or book now
        </Text>
      </View>
    </View>
  );
};

export const SpecialOffersSection: React.FC<{
  onOfferPress?: (offer: SpecialOffer) => void;
}> = ({ onOfferPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";

  return (
    <View style={[styles.section, { backgroundColor: bgColor }]}>
      <SpecialOffersCarousel onOfferPress={onOfferPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  section: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  carouselContainer: {
    height: 130,
    position: "relative",
    marginBottom: 12,
  },
  carouselContent: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: 0,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emojiBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 28,
  },
  discountBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  discountText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardTitleContainer: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  cardDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
    marginBottom: 10,
  },
  validOnContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  validOnLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginRight: 4,
  },
  validOnText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
  featuresContainer: {
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureBullet: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 8,
  },
  featureText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(245,158,11,0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transform: [{ translateY: -20 }],
  },
  navButtonLeft: {
    left: 4,
  },
  navButtonRight: {
    right: 4,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  quickInfo: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickInfoText: {
    fontSize: 12,
    textAlign: "center",
  },
});
