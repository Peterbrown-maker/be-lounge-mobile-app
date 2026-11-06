import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User, X } from "lucide-react-native";
import { memo, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from "../../auth/AuthContext";

const C = {
  bg: "#FFFFFF",
  surface: "#F5F5F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  muted: "#737373",
  placeholder: "#A3A3A3",
  ember: "#FF6B1A",
  emberText: "#C2410C",
  error: "#DC2626",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Memoized so typing doesn't re-render the whole form (keeps focus stable).
const FocusInput = memo(
  ({
    icon: Icon,
    rightIcon,
    label,
    error,
    inputRef,
    style,
    ...props
  }: TextInputProps & {
    inputRef?: React.Ref<TextInput>;
    icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
    rightIcon?: React.ReactNode;
    label: string;
    error?: string;
  }) => {
    const [focused, setFocused] = useState(false);
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputContainer, focused && styles.inputFocused, !!error && styles.inputError]}>
          <Icon size={18} color={focused ? C.text : C.placeholder} strokeWidth={1.8} />
          <TextInput
            ref={inputRef}
            placeholderTextColor={C.placeholder}
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
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);
FocusInput.displayName = "FocusInput";

type Errors = Partial<Record<"name" | "email" | "password", string>>;

export const LoginScreen = ({ onLogin }: { onLogin?: () => void }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const switchMode = useCallback((login: boolean) => {
    Haptics.selectionAsync();
    setIsLogin(login);
    setErrors({});
  }, []);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!isLogin && name.trim().length < 2) next.name = "Tell us your name";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "At least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    try {
      if (isLogin) await signIn(email.trim(), password);
      else await signUp(email.trim(), password, name.trim(), phone.trim());
      onLogin?.();
    } catch (error: any) {
      Alert.alert(isLogin ? "Couldn't sign in" : "Couldn't create account", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!EMAIL_RE.test(resetEmail.trim())) {
      Alert.alert("Check your email", "Please enter a valid email address.");
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      setShowReset(false);
      Alert.alert("Reset link sent", "Check your inbox for instructions to reset your password.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Photo header */}
        <View style={styles.hero}>
          <Image source={require("../../assets/makhanani/full_plate.jpg")} style={styles.heroImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.75)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Image source={require("../../assets/makhanani/wordmark.png")} style={styles.heroLogo} resizeMode="contain" />
            <Text style={styles.heroTagline}>COOKED TO PERFECTION</Text>
          </View>
        </View>

        {/* Sheet */}
        <View style={styles.sheet}>
          <Text style={styles.title}>{isLogin ? "Welcome back" : "Join the table"}</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to order your head meat and book your spot."
              : "Create an account to order, book tables and track deliveries."}
          </Text>

          {/* Mode switch */}
          <View style={styles.segment}>
            {[
              { login: true, label: "Sign in" },
              { login: false, label: "Create account" },
            ].map(({ login, label }) => {
              const active = isLogin === login;
              return (
                <TouchableOpacity
                  key={label}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => switchMode(login)}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!isLogin && (
            <FocusInput
              label="Full name"
              icon={User}
              placeholder="Thabo Mokoena"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.name}
            />
          )}

          <FocusInput
            inputRef={emailRef}
            label="Email"
            icon={Mail}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => (isLogin ? passwordRef.current?.focus() : phoneRef.current?.focus())}
            error={errors.email}
          />

          {!isLogin && (
            <FocusInput
              inputRef={phoneRef}
              label="Phone (optional)"
              icon={Phone}
              placeholder="071 234 5678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          )}

          <FocusInput
            inputRef={passwordRef}
            label="Password"
            icon={Lock}
            placeholder={isLogin ? "Your password" : "At least 6 characters"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete={isLogin ? "password" : "new-password"}
            returnKeyType="go"
            onSubmitEditing={handleAuth}
            error={errors.password}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} color={C.placeholder} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} color={C.placeholder} strokeWidth={1.8} />
                )}
              </TouchableOpacity>
            }
          />

          {isLogin && (
            <TouchableOpacity
              style={styles.forgot}
              onPress={() => {
                setResetEmail(email);
                setShowReset(true);
              }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleAuth}
            activeOpacity={0.85}
            disabled={loading}
            style={[styles.primary, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.primaryText}>{isLogin ? "Sign in" : "Create account"}</Text>
                <ArrowRight size={18} color="#FFF" strokeWidth={2} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to Makhanani's terms.
          </Text>
        </View>
      </ScrollView>

      {/* Reset password */}
      <Modal visible={showReset} transparent animationType="fade" onRequestClose={() => setShowReset(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowReset(false)}>
          <Pressable style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowReset(false)} accessibilityLabel="Close">
              <X size={20} color={C.muted} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.modalIcon}>
              <Mail size={22} color={C.emberText} strokeWidth={1.8} />
            </View>
            <Text style={styles.modalTitle}>Reset your password</Text>
            <Text style={styles.modalSubtitle}>Enter your email and we'll send you a reset link.</Text>
            <View style={[styles.inputContainer, { marginTop: 16 }]}>
              <Mail size={18} color={C.placeholder} strokeWidth={1.8} />
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={C.placeholder}
                value={resetEmail}
                onChangeText={setResetEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowReset(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSend} onPress={handleReset} disabled={resetLoading}>
                {resetLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSendText}>Send link</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { flexGrow: 1 },

  hero: { height: 240, backgroundColor: "#000" },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 12 },
  heroLogo: { width: 240, height: 82 },
  heroTagline: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700", letterSpacing: 3, marginTop: 8 },

  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  title: { color: C.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 22, marginTop: 6 },

  segment: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 4,
    marginTop: 22,
    marginBottom: 18,
  },
  segmentBtn: { flex: 1, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segmentBtnActive: {
    backgroundColor: C.bg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: { color: C.muted, fontSize: 14, fontWeight: "600" },
  segmentTextActive: { color: C.text, fontWeight: "800" },

  field: { marginBottom: 14 },
  label: { color: C.text, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.surface,
  },
  inputFocused: { borderColor: C.text, backgroundColor: C.bg },
  inputError: { borderColor: C.error },
  input: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 0, alignSelf: "stretch" },
  errorText: { color: C.error, fontSize: 12, marginTop: 5 },

  forgot: { alignSelf: "flex-end", paddingVertical: 4, marginTop: -4, marginBottom: 8 },
  forgotText: { color: C.emberText, fontSize: 13, fontWeight: "700" },

  primary: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  primaryText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  legal: { color: C.placeholder, fontSize: 12, textAlign: "center", marginTop: 18, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-start", padding: 24, paddingTop: 72 },
  modalCard: { backgroundColor: C.bg, borderRadius: 24, padding: 22 },
  modalClose: { position: "absolute", top: 14, right: 14, padding: 4, zIndex: 1 },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,107,26,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: { color: C.text, fontSize: 20, fontWeight: "800" },
  modalSubtitle: { color: C.muted, fontSize: 14, marginTop: 4, lineHeight: 20 },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 18 },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { color: C.text, fontWeight: "700" },
  modalSend: { flex: 1, height: 48, borderRadius: 14, backgroundColor: C.text, alignItems: "center", justifyContent: "center" },
  modalSendText: { color: "#FFF", fontWeight: "800" },
});
