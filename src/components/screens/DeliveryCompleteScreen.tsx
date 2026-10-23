import * as ImagePicker from "expo-image-picker";
import { Camera, CheckCircle2, Star } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/ui/button";

interface DeliveryCompleteScreenProps {
  onDone: () => void;
}

export const DeliveryCompleteScreen = ({ onDone }: DeliveryCompleteScreenProps) => {
  const [rating, setRating] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for camera icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.5,
        allowsEditing: true,
      });

      if (!result.cancelled) {
        setPhotoUri(result.uri);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open camera.");
    }
  };

  return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed
      >
      {/* Success Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconBackground} />
        <View style={styles.icon}>
          <CheckCircle2 size={64} color="#22C55E" />
        </View>
      </View>

      {/* Success Message */}
      <View style={styles.messageWrapper}>
        <Text style={styles.title}>Item Delivered Successfully</Text>
        <Text style={styles.subtitle}>Your delivery has been completed!</Text>
      </View>

      {/* Proof of Delivery */}
      <View style={styles.proofWrapper}>
        <Text style={styles.proofTitle}>Proof of Delivery</Text>
        <TouchableOpacity style={styles.proofCard} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.proofImage} />
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Camera size={40} color="#9CA3AF" />
              <Text style={styles.proofText}>Tap to capture photo</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>

      {/* Rating Section */}
      <View style={styles.ratingWrapper}>
        <Text style={styles.ratingTitle}>Rate Your Rider</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Star
                size={40}
                color={star <= rating ? "#FACC15" : "#9CA3AF"}
                fill={star <= rating ? "#FACC15" : "transparent"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Done Button */}
      <View style={styles.buttonWrapper}>
        <Button style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 24,
    position: "relative",
  },
  iconBackground: {
    position: "absolute",
    width: 180,
    height: 180,
    backgroundColor: "rgba(34,197,94,0.2)",
    borderRadius: 90,
    top: -20,
    left: -20,
    zIndex: 0,
  },
  icon: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  messageWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  proofWrapper: {
    width: "100%",
    marginBottom: 32,
    alignItems: "center",
  },
  proofTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  proofCard: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  proofImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  proofText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 6,
  },
  ratingWrapper: {
    alignItems: "center",
    marginBottom: 40,
  },
  ratingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    width: "100%",
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
