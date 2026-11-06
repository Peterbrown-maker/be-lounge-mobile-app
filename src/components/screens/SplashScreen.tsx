import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StatusBar, StyleSheet, Text, View } from "react-native";

// Light brand palette shared with Home / Login / Onboarding.
const C = {
  bg: "#FFFFFF",
  text: "#0A0A0A",
  muted: "#737373",
  ember: "#FF6B1A",
  track: "#F0F0F0",
};

const DURATION = 2400;

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(12)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ember glow "breathing" behind the logo, like coals.
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    glowLoop.start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeOut, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => onComplete());
    }, DURATION);

    return () => {
      clearTimeout(timer);
      glowLoop.stop();
    };
  }, []);

  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.center}>
        <View style={styles.logoStack}>
          <Animated.View style={[styles.glowOuter, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
          <View style={styles.glowInner} />
          <Animated.View style={[styles.logoCircle, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <Image source={require("../../assets/brianos/mark-black.png")} style={styles.mark} resizeMode="contain" />
          </Animated.View>
        </View>

        <Animated.View style={{ alignItems: "center", opacity: textOpacity, transform: [{ translateY: textSlide }] }}>
          <Image source={require("../../assets/brianos/logo-black.png")} style={styles.wordmark} resizeMode="contain" />
          <Text style={styles.tagline}>SHISANYAMA · BAR · LOUNGE</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { width: barWidth }]} />
        </View>
        <Text style={styles.footerText}>Firing up the braai…</Text>
      </View>
    </Animated.View>
  );
};

const LOGO = 132;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center" },
  logoStack: { width: LOGO * 1.9, height: LOGO * 1.9, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  glowOuter: {
    position: "absolute",
    width: LOGO * 1.8,
    height: LOGO * 1.8,
    borderRadius: LOGO,
    backgroundColor: "rgba(255,107,26,0.18)",
  },
  glowInner: {
    position: "absolute",
    width: LOGO * 1.3,
    height: LOGO * 1.3,
    borderRadius: LOGO,
    backgroundColor: "rgba(255,107,26,0.12)",
  },
  logoCircle: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.ember,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  mark: { width: LOGO * 0.62, height: LOGO * 0.62 },
  wordmark: { width: 200, height: 56 },
  tagline: { marginTop: 10, color: C.muted, fontSize: 12, fontWeight: "700", letterSpacing: 3 },
  footer: { position: "absolute", bottom: 56, left: 48, right: 48, alignItems: "center" },
  track: { width: "100%", height: 4, borderRadius: 2, backgroundColor: C.track, overflow: "hidden" },
  bar: { height: 4, borderRadius: 2, backgroundColor: C.ember },
  footerText: { marginTop: 12, color: C.muted, fontSize: 13 },
});
