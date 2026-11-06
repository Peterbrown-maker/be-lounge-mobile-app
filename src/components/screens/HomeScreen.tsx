import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Flame,
  LocateFixed,
  Minus,
  Music2,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Store,
  Utensils,
  Zap,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { venueStatus, WEEKLY_LINEUP } from "../../data/brianosClub";
import { ALL_MENU_ITEMS, BRIANOS_MENU, BrianosMenuItem } from "../../data/brianosMenu";
import { useCurrentLocation } from "../../location/useCurrentLocation";
import { ProfileAvatar } from "../ProfileAvatar";
import { SpecialOffersCarousel } from "./SpecialOffersScreen";

// Light by default: white canvas, Briano's black type, one ember accent for the fire.
const C = {
  bg: "#FFFFFF",
  surface: "#F5F5F5",
  surface2: "#FFFFFF",
  border: "#E5E5E5",
  text: "#0A0A0A",
  muted: "#737373",
  ember: "#FF6B1A",
  emberText: "#C2410C", // darker ember for small text on white (readable contrast)
  emberSoft: "rgba(255,107,26,0.12)",
  live: "#22C55E",
  onImage: "#FFFFFF", // text sitting on photos
};

export type OrderMode = "delivery" | "takeaway" | "sitin";

export interface HomeCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: any;
}

interface Category {
  id: keyof typeof BRIANOS_MENU | string;
  name: string;
  image: any;
}

const CATEGORIES: Category[] = [
  { id: "grills", name: "Off the braai", image: require("../../assets/brianos/grilled_chicken.jpg") },
  { id: "platters", name: "Shisa platters", image: require("../../assets/brianos/mixed_grill_platter.jpg") },
  { id: "steak", name: "Steak & chops", image: require("../../assets/brianos/steak_and_lamb_chops.jpg") },
  { id: "wings", name: "Wings & wors", image: require("../../assets/brianos/wings_and_sausage.jpg") },
  { id: "ribs", name: "Sticky ribs", image: require("../../assets/brianos/glazed_ribs.jpg") },
  { id: "burgers", name: "Burgers", image: require("../../assets/brianos/cheeseburger_and_chips.jpg") },
  { id: "seafood", name: "Seafood", image: require("../../assets/brianos/seafood_platter.jpg") },
  { id: "cocktails", name: "Bar & cocktails", image: require("../../assets/brianos/cocktails.jpg") },
];

const MODES: { id: OrderMode; label: string; Icon: typeof Zap }[] = [
  { id: "delivery", label: "Delivery", Icon: Zap },
  { id: "takeaway", label: "Collect", Icon: ShoppingBag },
  { id: "sitin", label: "Sit-in", Icon: Utensils },
];

interface HomeScreenProps {
  onFeatureSelect: (feature: string) => void;
  onNavigateToMap: () => void;
  onFoodCategorySelect: (input: string) => void;
  onProfilePress: () => void;
  onNotificationsPress: () => void;
  /** Go to checkout with the cart and the chosen order mode. */
  onCheckout?: (items: HomeCartItem[], mode: OrderMode) => void;
  /** Cart to restore when coming back from checkout. */
  initialCart?: { id: string; quantity: number }[];
  initialMode?: OrderMode;
}

export const HomeScreen = ({
  onProfilePress,
  onNotificationsPress,
  onCheckout,
  initialCart = [],
  initialMode = "delivery",
}: HomeScreenProps) => {
  const { userProfile } = useAuth();
  const { status: locStatus, location, refresh: refreshLocation } = useCurrentLocation();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mode, setMode] = useState<OrderMode>(initialMode);
  const [cart, setCart] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      initialCart.filter((i) => ALL_MENU_ITEMS.some((m) => m.id === i.id)).map((i) => [i.id, i.quantity])
    )
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const venue = venueStatus();
  const today = new Date().getDay();
  const firstName = (userProfile?.display_name || "").split(" ")[0];

  // ----- cart -----
  const itemsById = useMemo(() => Object.fromEntries(ALL_MENU_ITEMS.map((i) => [i.id, i])), []);
  const changeQty = (id: string, delta: number) =>
    setCart((prev) => {
      const qty = Math.max(0, (prev[id] || 0) + delta);
      const next = { ...prev };
      if (qty === 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  const cartItems: HomeCartItem[] = Object.entries(cart).map(([id, quantity]) => {
    const item = itemsById[id];
    return { id, name: item.name, price: item.price, quantity, image: item.image };
  });
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cartItems.reduce((n, i) => n + i.quantity * i.price, 0);

  // ----- search / category -----
  const query = searchText.trim().toLowerCase();
  const searchResults = query
    ? ALL_MENU_ITEMS.filter(
        (i) => i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
      )
    : [];
  const categoryItems = selectedCategory ? BRIANOS_MENU[selectedCategory] || [] : [];
  const crowdFavourites = [...ALL_MENU_ITEMS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  // ----- location chip -----
  const locationLine =
    mode === "delivery"
      ? locStatus === "locating"
        ? "Finding you…"
        : locStatus === "ready" && location
          ? location.label
          : locStatus === "denied"
            ? "Turn on location to deliver"
            : "Tap to use my location"
      : mode === "takeaway"
        ? "Collect at Briano's · ready in 20 min"
        : "Grab a table at Briano's";

  const renderMenuRow = (item: BrianosMenuItem) => {
    const qty = cart[item.id] || 0;
    return (
      <View key={item.id} style={styles.menuRow}>
        <Image source={item.image} style={styles.menuImage} />
        <View style={styles.menuInfo}>
          <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.menuFooter}>
            <Text style={styles.menuPrice}>R{item.price}</Text>
            <View style={styles.ratingPill}>
              <Star size={11} color={C.emberText} fill={C.emberText} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
        {qty === 0 ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => changeQty(item.id, 1)} accessibilityLabel={`Add ${item.name}`}>
            <Plus size={18} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => changeQty(item.id, -1)} style={styles.stepBtn} accessibilityLabel="Remove one">
              <Minus size={14} color={C.text} />
            </TouchableOpacity>
            <Text style={styles.stepQty}>{qty}</Text>
            <TouchableOpacity onPress={() => changeQty(item.id, 1)} style={styles.stepBtn} accessibilityLabel="Add one">
              <Plus size={14} color={C.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}{firstName ? `, ${firstName}` : ""}</Text>
          <TouchableOpacity
            style={styles.locationChip}
            onPress={mode === "delivery" ? refreshLocation : undefined}
            activeOpacity={mode === "delivery" ? 0.7 : 1}
          >
            {mode === "delivery" && locStatus === "locating" ? (
              <ActivityIndicator size="small" color={C.ember} />
            ) : mode === "delivery" ? (
              <LocateFixed size={15} color={C.ember} />
            ) : (
              <Store size={15} color={C.ember} />
            )}
            <Text style={styles.locationText} numberOfLines={1}>{locationLine}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={onNotificationsPress} accessibilityLabel="Notifications">
          <Bell size={20} color={C.text} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfilePress} accessibilityLabel="Profile">
          <ProfileAvatar size={42} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={18} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search the braai, bar & more"
          placeholderTextColor={C.muted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 120 : 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {query ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchResults.length ? `Results for “${searchText.trim()}”` : "Nothing on the menu matches that"}
            </Text>
            {searchResults.map(renderMenuRow)}
          </View>
        ) : selectedCategory ? (
          <View style={styles.section}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.iconBtn} accessibilityLabel="Back">
                <ArrowLeft size={20} color={C.text} />
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </Text>
            </View>
            {categoryItems.map(renderMenuRow)}
          </View>
        ) : (
          <>
            {/* Hero: tonight at Briano's */}
            <View style={styles.heroWrap}>
              <Image source={require("../../assets/brianos/hero_feast.jpg")} style={styles.heroImage} />
              <LinearGradient
                colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.95)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroContent}>
                <Image
                  source={require("../../assets/brianos/logo-white.png")}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
                <View style={styles.statusPill}>
                  <View style={[styles.statusDot, { backgroundColor: venue.open ? C.live : C.muted }]} />
                  <Text style={styles.statusText}>{venue.open ? "Open now" : "Closed"} · {venue.label}</Text>
                </View>
                <Text style={styles.heroTitle}>Braai. Drinks. Vibes.</Text>
                <Text style={styles.heroSub}>Shisanyama by day, club by night. Order the meat — or come through.</Text>
                <View style={styles.heroCtas}>
                  <TouchableOpacity
                    style={styles.ctaPrimary}
                    onPress={() => {
                      setMode("delivery");
                      setSelectedCategory("platters");
                    }}
                  >
                    <Flame size={16} color="#000" />
                    <Text style={styles.ctaPrimaryText}>Order the braai</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ctaGhost}
                    onPress={() => onCheckout?.(cartItems, "sitin")}
                  >
                    <CalendarDays size={16} color={C.onImage} />
                    <Text style={styles.ctaGhostText}>Book a table</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* How do you want it? */}
            <View style={styles.modeRow}>
              {MODES.map(({ id, label, Icon }) => {
                const active = mode === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.modeBtn, active && styles.modeBtnActive]}
                    onPress={() => {
                      setMode(id);
                      if (id === "delivery" && locStatus !== "ready") refreshLocation();
                    }}
                    accessibilityState={{ selected: active }}
                  >
                    <Icon size={16} color={active ? "#FFFFFF" : C.text} />
                    <Text style={[styles.modeText, active && { color: "#FFFFFF" }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Weekly line-up */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Music2 size={18} color={C.ember} />
                <Text style={styles.sectionTitle}>This week at Briano's</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                {WEEKLY_LINEUP.map((ev) => {
                  const isToday = ev.day === today;
                  return (
                    <View key={ev.id} style={[styles.eventCard, isToday && { borderColor: C.ember }]}>
                      <Image source={ev.image} style={styles.eventImage} />
                      <LinearGradient colors={["transparent", "rgba(0,0,0,0.92)"]} style={StyleSheet.absoluteFill} />
                      <View style={[styles.dayBadge, isToday && { backgroundColor: C.ember }]}>
                        <Text style={[styles.dayBadgeText, isToday && { color: "#000" }]}>
                          {isToday ? "TONIGHT" : ev.dayLabel}
                        </Text>
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{ev.title}</Text>
                        <Text style={styles.eventVibe} numberOfLines={1}>{ev.vibe}</Text>
                        <Text style={styles.eventTime}>{ev.time}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Limited time deals */}
            <SpecialOffersCarousel
              onOfferPress={(offer) =>
                Alert.alert(offer.title, `${offer.description}

Valid: ${offer.validOn}`)
              }
            />

            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Flame size={18} color={C.ember} />
                <Text style={styles.sectionTitle}>From the fire</Text>
              </View>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryTile}
                    onPress={() => setSelectedCategory(cat.id as string)}
                    activeOpacity={0.8}
                  >
                    <Image source={cat.image} style={styles.categoryImage} />
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Squad platter banner */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.banner} onPress={() => setSelectedCategory("platters")} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerKicker}>FOR THE SQUAD</Text>
                  <Text style={styles.bannerTitle}>Mixed Grill Platter</Text>
                  <Text style={styles.bannerSub}>Chops, wors, wings & pap — made to share</Text>
                  <View style={styles.bannerLink}>
                    <Text style={styles.bannerLinkText}>See platters</Text>
                    <ChevronRight size={16} color="#000" />
                  </View>
                </View>
                <Image source={require("../../assets/brianos/mixed_grill_platter.jpg")} style={styles.bannerImage} />
              </TouchableOpacity>
            </View>

            {/* Crowd favourites */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Star size={18} color={C.ember} fill={C.ember} />
                <Text style={styles.sectionTitle}>Crowd favourites</Text>
              </View>
              {crowdFavourites.map(renderMenuRow)}
            </View>
          </>
        )}
      </ScrollView>

      {/* Cart bar */}
      {cartCount > 0 && (
        <View style={styles.cartBarWrap}>
          <TouchableOpacity
            style={styles.cartBar}
            onPress={() => {
              if (mode === "delivery" && locStatus !== "ready") refreshLocation();
              onCheckout?.(cartItems, mode);
            }}
            activeOpacity={0.9}
          >
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarText}>
              {mode === "delivery" ? "Deliver to me" : mode === "takeaway" ? "Collect order" : "Order to my table"}
            </Text>
            <Text style={styles.cartBarTotal}>R{cartTotal}</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still going";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  greeting: { color: C.text, fontSize: 20, fontWeight: "700" },
  locationChip: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, alignSelf: "flex-start", maxWidth: "100%" },
  locationText: { color: C.muted, fontSize: 13, flexShrink: 1 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, justifyContent: "center", alignItems: "center",
  },
  bellDot: { position: "absolute", top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: C.ember },

  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 6, marginBottom: 12,
    paddingHorizontal: 14, height: 46, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15 },

  heroWrap: { marginHorizontal: 16, height: 300, borderRadius: 22, overflow: "hidden", backgroundColor: C.surface },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: 18 },
  heroLogo: { position: "absolute", top: 16, left: 18, width: 110, height: 40 },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: 10,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: C.onImage, fontSize: 12, fontWeight: "600" },
  heroTitle: { color: C.onImage, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  heroSub: { color: "#D4D4D4", fontSize: 14, marginTop: 4, lineHeight: 20 },
  heroCtas: { flexDirection: "row", gap: 10, marginTop: 14 },
  ctaPrimary: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.ember,
    paddingHorizontal: 16, height: 44, borderRadius: 999,
  },
  ctaPrimaryText: { color: "#000", fontWeight: "700", fontSize: 14 },
  ctaGhost: {
    flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 16, height: 44, borderRadius: 999,
  },
  ctaGhostText: { color: C.onImage, fontWeight: "600", fontSize: 14 },

  modeRow: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 16, padding: 4, borderRadius: 14,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  modeBtn: { flex: 1, flexDirection: "row", gap: 6, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modeBtnActive: { backgroundColor: C.text },
  modeText: { color: C.text, fontWeight: "600", fontSize: 14 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: "700" },
  hScroll: { gap: 12, paddingRight: 16 },

  eventCard: {
    width: 220, height: 150, borderRadius: 18, overflow: "hidden",
    backgroundColor: C.surface, borderWidth: 2, borderColor: "transparent",
  },
  eventImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  dayBadge: {
    position: "absolute", top: 10, left: 10, backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  dayBadgeText: { color: C.onImage, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  eventInfo: { position: "absolute", left: 12, right: 12, bottom: 10 },
  eventTitle: { color: C.onImage, fontSize: 16, fontWeight: "700" },
  eventVibe: { color: "#D4D4D4", fontSize: 12, marginTop: 2 },
  eventTime: { color: C.ember, fontSize: 12, fontWeight: "700", marginTop: 4 },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryTile: { width: "48%", flexGrow: 1, height: 96, borderRadius: 16, overflow: "hidden", backgroundColor: C.surface },
  categoryImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  categoryName: { position: "absolute", left: 12, bottom: 10, color: C.onImage, fontSize: 15, fontWeight: "700" },

  banner: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.ember,
    borderRadius: 20, padding: 16, overflow: "hidden",
  },
  bannerKicker: { color: "#000", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, opacity: 0.7 },
  bannerTitle: { color: "#000", fontSize: 20, fontWeight: "800", marginTop: 2 },
  bannerSub: { color: "#1A1A1A", fontSize: 13, marginTop: 4 },
  bannerLink: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  bannerLinkText: { color: "#000", fontWeight: "700", fontSize: 14 },
  bannerImage: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: "#000" },

  categoryHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  categoryTitle: { color: C.text, fontSize: 22, fontWeight: "800" },

  menuRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 10, marginBottom: 10,
    borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  menuImage: { width: 78, height: 78, borderRadius: 12 },
  menuInfo: { flex: 1 },
  menuName: { color: C.text, fontSize: 15, fontWeight: "700" },
  menuDesc: { color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  menuFooter: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  menuPrice: { color: C.text, fontSize: 15, fontWeight: "800" },
  ratingPill: {
    flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.emberSoft,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999,
  },
  ratingText: { color: C.emberText, fontSize: 11, fontWeight: "700" },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.ember, justifyContent: "center", alignItems: "center" },
  stepper: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.surface2,
    borderRadius: 999, borderWidth: 1, borderColor: C.ember,
  },
  stepBtn: { width: 32, height: 34, justifyContent: "center", alignItems: "center" },
  stepQty: { color: C.text, fontWeight: "800", minWidth: 16, textAlign: "center" },

  cartBarWrap: { position: "absolute", left: 16, right: 16, bottom: 16 },
  cartBar: {
    flexDirection: "row", alignItems: "center", gap: 12, height: 58, borderRadius: 18,
    paddingHorizontal: 14, backgroundColor: C.ember,
    shadowColor: C.ember, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  cartCount: { minWidth: 30, height: 30, borderRadius: 15, backgroundColor: "#000", justifyContent: "center", alignItems: "center", paddingHorizontal: 6 },
  cartCountText: { color: C.ember, fontWeight: "800" },
  cartBarText: { flex: 1, color: "#000", fontSize: 16, fontWeight: "800" },
  cartBarTotal: { color: "#000", fontSize: 16, fontWeight: "800" },
});
