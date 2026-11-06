import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StatusBar, StyleSheet, Text, View } from "react-native";

// Black to match the Makhanani emblem.
const C = {
  bg: "#000000",
  muted: "#A3A3A3",
  ember: "#FF6B1A",
  track: "#262626",
};

const DURATION = 2400;

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
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

    return () => clearTimeout(timer);
  }, []);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={require("../../assets/makhanani/emblem.jpg")} style={styles.emblem} resizeMode="contain" />
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { width: barWidth }]} />
        </View>
        <Text style={styles.footerText}>Firing up the grill…</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  emblem: { width: 300, height: 300 },
  footer: { position: "absolute", bottom: 56, left: 48, right: 48, alignItems: "center" },
  track: { width: "100%", height: 4, borderRadius: 2, backgroundColor: C.track, overflow: "hidden" },
  bar: { height: 4, borderRadius: 2, backgroundColor: C.ember },
  footerText: { marginTop: 12, color: C.muted, fontSize: 13 },
});
