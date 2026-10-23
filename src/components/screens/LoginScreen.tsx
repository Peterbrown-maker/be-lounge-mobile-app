import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  AlertCircle,
  ArrowRight,
  X,
} from "lucide-react-native";
import { useAuth } from "../../auth/AuthContext";

const { width } = Dimensions.get("window");

// Memoized input to prevent re-renders from parent
const FocusInput = memo(({
  icon: Icon,
  rightIcon,
  style,
  ...props
}: TextInputProps & {
  icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
  rightIcon?: React.ReactNode;
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={[styles.inputContainer, focused && styles.inputFocused]}>
      <Icon size={18} color={focused ? "#2563EB" : "#94A3B8"} strokeWidth={1.8} />
      <TextInput
        ref={inputRef}
        placeholderTextColor="#94A3B8"
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, style]}
      />
      {rightIcon}
    </View>
  );
});

FocusInput.displayName = 'FocusInput';

export const LoginScreen = ({ onLogin }: { onLogin?: () => void }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animations (only for header, not form - animated forms break TextInput focus)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSwitch = useCallback(() => {
    Haptics.selectionAsync();
    setIsLogin(!isLogin);
  }, [isLogin]);

  const handleAuth = useCallback(async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name, phone);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [isLogin, email, password, name, phone, signIn, signUp]);

  const handleForgotPasswordSubmit = useCallback(async () => {
    if (!resetEmail.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    try {
      await resetPassword(resetEmail);
      setShowForgotPasswordModal(false);
      Alert.alert("Password Reset Sent", "Check your email for password reset instructions.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }, [resetEmail, resetPassword]);

  const handleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleOpenForgotPassword = useCallback(() => {
    setResetEmail(email);
    setShowForgotPasswordModal(true);
  }, [email]);

  const handleCloseForgotPassword = useCallback(() => {
    setShowForgotPasswordModal(false);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative top accent */}
        <View style={styles.topDecor}>
          <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.decorCircle}
          />
          <View style={styles.decorCircleOutline} />
          <View style={styles.decorDot1} />
          <View style={styles.decorDot2} />
        </View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Image
            source={require("../../assets/images/Flavor-Logo-New-No-Glow-1-e1779706388288.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            {isLogin ? "Welcome back" : "Create account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to order deliveries with Flavor Hospitality"
              : "Join Flavor Hos Deliveries today"}
          </Text>
        </Animated.View>

        {/* Form */}
        <View style={styles.form}>
          {/* Sign up: name field */}
          {!isLogin && (
            <FocusInput
              icon={User}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          {/* Email */}
          <FocusInput
            icon={Mail}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Sign up: phone field */}
          {!isLogin && (
            <FocusInput
              icon={Phone}
              placeholder="Phone number (optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          )}

          {/* Password */}
          <FocusInput
            icon={Lock}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity
                onPress={handleShowPassword}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#94A3B8" strokeWidth={1.8} />
                ) : (
                  <Eye size={18} color="#94A3B8" strokeWidth={1.8} />
                )}
              </TouchableOpacity>
            }
          />

          {/* Forgot password */}
          {isLogin && (
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleOpenForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Primary action */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleAuth}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            >
              <Text style={styles.primaryButtonText}>
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </Text>
              {!loading && (
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Alert.alert("Coming Soon", "Google sign-in will be available soon.")}
            >
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Alert.alert("Coming Soon", "Apple sign-in will be available soon.")}
            >
              <Text style={[styles.socialIcon, { fontSize: 20 }]}></Text>
            </TouchableOpacity>
          </View>

          {/* Switch mode */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={handleSwitch}>
              <Text style={styles.switchLink}>
                {isLogin ? " Sign Up" : " Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>Flavor Hospitality Deliveries</Text>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseForgotPassword}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseForgotPassword}
        >
          <Pressable style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={handleCloseForgotPassword}
            >
              <X size={20} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              <LinearGradient
                colors={["#EFF6FF", "#DBEAFE"]}
                style={styles.modalIconCircle}
              >
                <Mail size={24} color="#2563EB" strokeWidth={1.8} />
              </LinearGradient>
            </View>

            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email and we'll send you a reset link.
            </Text>

            <View style={[styles.inputContainer, styles.modalInput]}>
              <Mail size={18} color="#94A3B8" strokeWidth={1.8} />
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#94A3B8"
                value={resetEmail}
                onChangeText={setResetEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={handleCloseForgotPassword}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleForgotPasswordSubmit}
                style={{ flex: 1 }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8"]}
                  style={styles.modalSend}
                >
                  <Text style={styles.modalSendText}>Send Link</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingBottom: 32,
  },

  // Decorative top
  topDecor: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
  },
  decorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.07,
  },
  decorCircleOutline: {
    position: "absolute",
    top: 20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(37,99,235,0.08)",
  },
  decorDot1: {
    position: "absolute",
    top: 80,
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(37,99,235,0.1)",
  },
  decorDot2: {
    position: "absolute",
    top: 40,
    right: 60,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(37,99,235,0.12)",
  },

  // Header
  header: {
    marginBottom: 36,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },

  // Form
  form: {
    gap: 14,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 4,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  inputFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#FAFCFF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    paddingVertical: Platform.OS === "ios" ? 0 : 10,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },

  // Actions
  actions: {
    gap: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 13,
    color: "#94A3B8",
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchText: {
    fontSize: 15,
    color: "#64748B",
  },
  switchLink: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "700",
  },

  // Footer
  footer: {
    marginTop: "auto",
    paddingTop: 24,
    alignItems: "center",
  },
  footerDivider: {
    width: 32,
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  modalIconWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  modalSend: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalSendText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});