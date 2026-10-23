import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(40)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.5)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0)).current;
  const dotOpacity2 = useRef(new Animated.Value(0)).current;
  const dotOpacity3 = useRef(new Animated.Value(0)).current;
  const shimmerTranslate = useRef(new Animated.Value(-width)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Expanding rings
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 2.5, duration: 2000, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(ringOpacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Second ring with delay
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ring2Scale, { toValue: 2.5, duration: 2000, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(ring2Opacity, { toValue: 0.2, duration: 400, useNativeDriver: true }),
              Animated.timing(ring2Opacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(ring2Scale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, 1000);

    // Main entrance sequence
    Animated.sequence([
      // 1. Logo appears with spring
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // 3. Subtitle slides up
      Animated.parallel([
        Animated.timing(subtitleSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 4. Tagline fades in
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Loading dots animation
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(dotOpacity1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dotOpacity2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dotOpacity3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };
    setTimeout(animateDots, 1500);

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerTranslate, {
        toValue: width,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Exit
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1410" />
      <LinearGradient
        colors={["#1a1410", "#2d2416", "#3d3520"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating decorative elements */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingDot, { top: "15%", left: "10%", width: 6, height: 6, backgroundColor: "rgba(245,158,11,0.4)" }]} />
        <View style={[styles.floatingDot, { top: "25%", right: "15%", width: 8, height: 8, backgroundColor: "rgba(251,146,60,0.3)" }]} />
        <View style={[styles.floatingDot, { top: "65%", left: "20%", width: 4, height: 4, backgroundColor: "rgba(245,158,11,0.5)" }]} />
        <View style={[styles.floatingDot, { top: "75%", right: "25%", width: 10, height: 10, backgroundColor: "rgba(251,146,60,0.2)" }]} />
        <View style={[styles.floatingDot, { top: "45%", left: "5%", width: 5, height: 5, backgroundColor: "rgba(251,191,36,0.3)" }]} />
        <View style={[styles.floatingDot, { top: "55%", right: "8%", width: 7, height: 7, backgroundColor: "rgba(245,158,11,0.25)" }]} />
      </View>

      {/* Pulsing rings behind logo */}
      <View style={styles.ringCenter}>
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ scale: ringScale }], opacity: ringOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ scale: ring2Scale }], opacity: ring2Opacity },
          ]}
        />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo with glow */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoGlow} />
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/images/Flavor-Logo-New-No-Glow-1-e1779706388288.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleSlide }],
          }}
        >
          <Text style={styles.title}>FLAVOR HOS</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleSlide }],
          }}
        >
          <Text style={styles.subtitle}>Flavor Hospitality</Text>
          {/* Shimmer line */}
          <View style={styles.shimmerContainer}>
            <Animated.View
              style={[
                styles.shimmerLine,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text style={styles.tagline}>Delicious Food. Fast Delivery.</Text>
        </Animated.View>
      </View>

      {/* Loading dots */}
      <View style={styles.loaderContainer}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.loadDot, { opacity: dotOpacity1 }]} />
          <Animated.View style={[styles.loadDot, { opacity: dotOpacity2 }]} />
          <Animated.View style={[styles.loadDot, { opacity: dotOpacity3 }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingElements: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingDot: {
    position: "absolute",
    borderRadius: 100,
  },
  ringCenter: {
    position: "absolute",
    top: height * 0.35,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(245,158,11,0.5)",
  },
  content: {
    alignItems: "center",
  },
  logoWrapper: {
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(245,158,11,0.15)",
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderWidth: 2,
    borderColor: "rgba(245,158,11,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#F59E0B",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 4,
  },
  shimmerContainer: {
    width: 120,
    height: 2,
    marginTop: 16,
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 1,
  },
  shimmerLine: {
    position: "absolute",
    width: 60,
    height: 2,
    backgroundColor: "rgba(245,158,11,0.6)",
    borderRadius: 1,
  },
  dividerLine: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(245,158,11,0.2)",
    borderRadius: 1,
  },
  tagline: {
    marginTop: 20,
    fontSize: 15,
    color: "rgba(251,191,36,0.9)",
    letterSpacing: 1,
    textAlign: "center",
  },
  loaderContainer: {
    position: "absolute",
    bottom: 60,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  loadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
  },
});
