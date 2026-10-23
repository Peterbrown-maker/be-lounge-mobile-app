import {
  Bike,
  ChefHat,
  Clock,
  Home,
  MapPin,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,

  Users,
  Zap,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  gradientColors: [string, string, string];
  accentColor: string;
  renderIllustration: (animValue: Animated.Value) => React.ReactNode;
}

const slides: Slide[] = [
  {
    title: "Flavor Hospitality's\nOwn Delivery App",
    subtitle: "WELCOME TO FLAVOR HOS",
    description:
      "Order from our restaurant, book sit-in tables, and get everything delivered fast — all from Flavor Hospitality.",
    gradientColors: ["#1a1410", "#2d2416", "#3d3520"],
    accentColor: "#F59E0B",
    renderIllustration: (anim: Animated.Value) => {
      const float1 = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
      const float2 = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
      const float3 = anim.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] });
      return (
        <View style={illustStyles.container}>
          {/* Central chef hat icon */}
          <Animated.View style={[illustStyles.centerIcon, { transform: [{ translateY: float1 }] }]}>
            <LinearGradient colors={["#F59E0B", "#DC8C03"]} style={illustStyles.centerGradient}>
              <ChefHat size={52} color="#FFFFFF" strokeWidth={1.5} />
            </LinearGradient>
          </Animated.View>
          {/* Orbiting icons */}
          <Animated.View style={[illustStyles.orbitIcon, { top: 0, left: 30, transform: [{ translateY: float2 }] }]}>
            <View style={[illustStyles.smallIcon, { backgroundColor: "rgba(34,197,94,0.15)" }]}>
              <ChefHat size={22} color="#22C55E" strokeWidth={1.5} />
            </View>
          </Animated.View>
          <Animated.View style={[illustStyles.orbitIcon, { top: 10, right: 20, transform: [{ translateY: float3 }] }]}>
            <View style={[illustStyles.smallIcon, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
              <Package size={22} color="#F59E0B" strokeWidth={1.5} />
            </View>
          </Animated.View>
          <Animated.View style={[illustStyles.orbitIcon, { bottom: 20, left: 15, transform: [{ translateY: float3 }] }]}>
            <View style={[illustStyles.smallIcon, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
              <ShoppingBag size={22} color="#A855F7" strokeWidth={1.5} />
            </View>
          </Animated.View>
          <Animated.View style={[illustStyles.orbitIcon, { bottom: 10, right: 30, transform: [{ translateY: float1 }] }]}>
            <View style={[illustStyles.smallIcon, { backgroundColor: "rgba(236,72,153,0.15)" }]}>
              <MapPin size={22} color="#EC4899" strokeWidth={1.5} />
            </View>
          </Animated.View>
          {/* Decorative rings */}
          <View style={[illustStyles.ring1, { borderColor: "rgba(245,158,11,0.15)" }]} />
          <View style={[illustStyles.ring2, { borderColor: "rgba(245,158,11,0.08)" }]} />
        </View>
      );
    },
  },
  {
    title: "Book Sit-in,\nTake-away & Delivery",
    subtitle: "YOUR CHOICE",
    description:
      "Choose how you want your meal: delivered hot, sit down with us, or pick it up yourself.",
    gradientColors: ["#1a1410", "#2d2416", "#3d3520"],
    accentColor: "#F59E0B",
    renderIllustration: (anim: Animated.Value) => {
      const float1 = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
      const float2 = anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
      const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.05, 1] });
      return (
        <View style={illustStyles.container}>
          {/* Service grid */}
          <View style={illustStyles.serviceGrid}>
            <Animated.View style={[illustStyles.serviceCard, { transform: [{ translateY: float1 }, { scale }] }]}>
              <LinearGradient colors={["rgba(245,158,11,0.2)", "rgba(245,158,11,0.05)"]} style={illustStyles.serviceGradient}>
                <Home size={28} color="#FBBF24" strokeWidth={1.5} />
                <Text style={[illustStyles.serviceLabel, { color: "#FBBF24" }]}>Sit-in</Text>
              </LinearGradient>
            </Animated.View>
            <Animated.View style={[illustStyles.serviceCard, { transform: [{ translateY: float2 }] }]}>
              <LinearGradient colors={["rgba(34,197,94,0.2)", "rgba(34,197,94,0.05)"]} style={illustStyles.serviceGradient}>
                <ShoppingBag size={28} color="#4ADE80" strokeWidth={1.5} />
                <Text style={[illustStyles.serviceLabel, { color: "#4ADE80" }]}>Take-away</Text>
              </LinearGradient>
            </Animated.View>
            <Animated.View style={[illustStyles.serviceCard, { transform: [{ translateY: float2 }] }]}>
              <LinearGradient colors={["rgba(59,130,246,0.2)", "rgba(59,130,246,0.05)"]} style={illustStyles.serviceGradient}>
                <Package size={28} color="#60A5FA" strokeWidth={1.5} />
                <Text style={[illustStyles.serviceLabel, { color: "#60A5FA" }]}>Delivery</Text>
              </LinearGradient>
            </Animated.View>
            <Animated.View style={[illustStyles.serviceCard, { transform: [{ translateY: float1 }, { scale }] }]}>
              <LinearGradient colors={["rgba(168,85,247,0.2)", "rgba(168,85,247,0.05)"]} style={illustStyles.serviceGradient}>
                <Sparkles size={28} color="#C084FC" strokeWidth={1.5} />
                <Text style={[illustStyles.serviceLabel, { color: "#C084FC" }]}>Special Offers</Text>
              </LinearGradient>
            </Animated.View>
          </View>
          {/* Center connector */}
          <Animated.View style={[illustStyles.connectorCenter, { transform: [{ scale }] }]}>
            <ChefHat size={20} color="#F59E0B" strokeWidth={2} />
          </Animated.View>
        </View>
      );
    },
  },
  {
    title: "Fast, Safe &\nDeliciously Delivered",
    subtitle: "WHY FLAVOR HOS",
    description:
      "Verified delivery partners, real-time tracking, and your food arrives fresh and on time.",
    gradientColors: ["#1a1410", "#2d2416", "#3d3520"],
    accentColor: "#F59E0B",
    renderIllustration: (anim: Animated.Value) => {
      const float1 = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
      const float2 = anim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
      const pulse = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] });
      return (
        <View style={illustStyles.container}>
          {/* Central shield */}
          <Animated.View style={[illustStyles.centerIcon, { transform: [{ translateY: float1 }, { scale: pulse }] }]}>
            <LinearGradient colors={["#F59E0B", "#DC8C03"]} style={illustStyles.centerGradient}>
              <Shield size={48} color="#FFFFFF" strokeWidth={1.5} />
            </LinearGradient>
          </Animated.View>
          {/* Feature badges */}
          <Animated.View style={[illustStyles.featureBadge, { top: 5, left: 10, transform: [{ translateY: float2 }] }]}>
            <View style={illustStyles.badgeInner}>
              <Clock size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={illustStyles.badgeText}>On Time</Text>
            </View>
          </Animated.View>
          <Animated.View style={[illustStyles.featureBadge, { top: 15, right: 5, transform: [{ translateY: float1 }] }]}>
            <View style={illustStyles.badgeInner}>
              <MapPin size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={illustStyles.badgeText}>Live Track</Text>
            </View>
          </Animated.View>
          <Animated.View style={[illustStyles.featureBadge, { bottom: 25, left: 20, transform: [{ translateY: float1 }] }]}>
            <View style={illustStyles.badgeInner}>
              <Users size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={illustStyles.badgeText}>Verified</Text>
            </View>
          </Animated.View>
          <Animated.View style={[illustStyles.featureBadge, { bottom: 15, right: 15, transform: [{ translateY: float2 }] }]}>
            <View style={illustStyles.badgeInner}>
              <Sparkles size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={illustStyles.badgeText}>Fresh Food</Text>
            </View>
          </Animated.View>
          <View style={[illustStyles.ring1, { borderColor: "rgba(245,158,11,0.15)" }]} />
          <View style={[illustStyles.ring2, { borderColor: "rgba(245,158,11,0.08)" }]} />
        </View>
      );
    },
  },
];

export const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Floating animation loop
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1, animated: true });
    } else {
      onComplete();
    }
  };

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const contentOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    const contentSlide = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, -50],
      extrapolate: "clamp",
    });

    const illustScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Background accent glow */}
        <View style={[styles.accentGlow, { backgroundColor: item.accentColor + "08" }]} />

        {/* Illustration area */}
        <Animated.View style={[styles.illustrationArea, { opacity: contentOpacity, transform: [{ scale: illustScale }] }]}>
          {item.renderIllustration(floatAnim)}
        </Animated.View>

        {/* Text content */}
        <Animated.View
          style={[
            styles.textArea,
            { opacity: contentOpacity, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <Text style={[styles.slideSubtitle, { color: item.accentColor }]}>
            {item.subtitle}
          </Text>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const currentAccentColor = slides[currentSlide].accentColor;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1410" />

      {/* Skip button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <LinearGradient
          colors={["transparent", slides[currentSlide].gradientColors[1]]}
          style={StyleSheet.absoluteFill}
        />

        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: currentAccentColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={
              currentSlide === slides.length - 1
                ? ["#F59E0B", "#DC8C03"]
                : [currentAccentColor, currentAccentColor + "DD"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>
              {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
            {currentSlide === slides.length - 1 && (
              <Sparkles size={18} color="#FFFFFF" strokeWidth={2} style={{ marginLeft: 8 }} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Page counter */}
        <Text style={styles.pageCounter}>
          {currentSlide + 1} / {slides.length}
        </Text>
      </View>
    </View>
  );
};

// Illustration sub-styles
const illustStyles = StyleSheet.create({
  container: {
    width: width * 0.75,
    height: width * 0.75,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centerIcon: {
    zIndex: 2,
  },
  centerGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  orbitIcon: {
    position: "absolute",
    zIndex: 1,
  },
  smallIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  ring1: {
    position: "absolute",
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.12)",
    borderStyle: "dashed",
  },
  ring2: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.06)",
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    width: width * 0.65,
  },
  serviceCard: {
    width: (width * 0.65 - 14) / 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  serviceGradient: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  connectorCenter: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(245,158,11,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
  },
  featureBadge: {
    position: "absolute",
    zIndex: 1,
  },
  badgeInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.3,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1410",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 56,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  skipText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  slide: {
    width,
    height: height - 200,
    justifyContent: "center",
    alignItems: "center",
  },
  accentGlow: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    top: -width * 0.3,
    alignSelf: "center",
  },
  illustrationArea: {
    marginBottom: 20,
  },
  textArea: {
    paddingHorizontal: 32,
    alignItems: "center",
  },
  slideSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 12,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 14,
  },
  slideDescription: {
    fontSize: 15,
    color: "rgba(148,163,184,0.9)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "android" ? 32 : 44,
    paddingTop: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  pageCounter: {
    textAlign: "center",
    color: "rgba(148,163,184,0.4)",
    fontSize: 12,
    marginTop: 14,
    fontWeight: "500",
  },
});
