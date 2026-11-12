import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  Flame,
  LocateFixed,
  MapPin,
  Minus,
  Music2,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Utensils,
  Zap,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../auth/AuthContext";
import {
  ALL_MENU_ITEMS,
  MACNOSE_CATEGORIES,
  MACNOSE_MENU,
  MacnoseMenuItem,
} from "../../data/macnoseMenu";
import { PROMOS, Promo, eventBadge, formatEntry, isTonight, upcomingEvents } from "../../data/macnoseEvents";
import { useCurrentLocation } from "../../location/useCurrentLocation";
import { useNotifications } from "../../services/notifications";
import { MACNOSE_INFO, MACNOSE_RESTAURANT } from "../../services/restaurants";
import { ProfileAvatar } from "../ProfileAvatar";

// Be Lounge palette (from the logo): white canvas, ink accent, steel for small accent text.
const C = {
  bg: "#FFFFFF",
  surface: "#F3F4F6",
  surface2: "#FFFFFF",
  border: "#E2E4E8",
  text: "#03060E",
  muted: "#6B7079",
  ember: "#0B0F19",
  emberText: "#4B515C",
  emberSoft: "rgba(11,15,25,0.07)",
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

// Hand-picked for "Start with these" on the home screen.
const FEATURED_IDS = [
  "specials-full-chicken-fries-2l-coke",
  "traditional-ox-tripe-mogodu",
  "grills-smoked-ribs-wings",
  "mains-oxtail",
  "platters-macnose-shisanyama-platter",
  "light-macnose-champagne-oysters",
];

/** Today's opening hours, from MACNOSE_INFO.hours (Mon-Thu, Fri-Sat, Sun). */
function todaysHours() {
  const d = new Date().getDay(); // 0 = Sunday
  const [monThu, friSat, sun] = MACNOSE_INFO.hours;
  return (d === 0 ? sun : d >= 5 ? friSat : monThu).time;
}

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
  /** Open on a menu category (e.g. from a deal notification). */
  initialCategory?: string | null;
  /** Open the events list ("What's on"). */
  onEventsPress?: () => void;
  /** Open one event's details. */
  onEventPress?: (eventId: string) => void;
}

export const HomeScreen = ({
  onProfilePress,
  onNotificationsPress,
  onCheckout,
  initialCart = [],
  initialMode = "delivery",
  initialCategory = null,
  onEventsPress,
  onEventPress,
}: HomeScreenProps) => {
  const { userProfile } = useAuth();
  const {
    status: locStatus,
    location,
    refresh: refreshLocation,
  } = useCurrentLocation();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const { unread } = useNotifications();
  const events = upcomingEvents();
  const [promoWidth, setPromoWidth] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);

  // Android back: close search, then the open category, then "press again to exit".
  const lastBackPress = useRef(0);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (searchText) {
        setSearchText("");
        return true;
      }
      if (selectedCategory) {
        setSelectedCategory(null);
        return true;
      }
      if (Platform.OS === "android" && Date.now() - lastBackPress.current > 2000) {
        lastBackPress.current = Date.now();
        ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
        return true;
      }
      return false; // let Android exit the app
    });
    return () => sub.remove();
  }, [searchText, selectedCategory]);

  const openPromo = (promo: Promo) => {
    if (promo.target.type === "event") onEventPress?.(promo.target.id);
    else setSelectedCategory(promo.target.id);
  };
  const [mode, setMode] = useState<OrderMode>(initialMode);
  const [cart, setCart] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      initialCart
        .filter((i) => ALL_MENU_ITEMS.some((m) => m.id === i.id))
        .map((i) => [i.id, i.quantity]),
    ),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const firstName = (userProfile?.display_name || "").split(" ")[0];

  // ----- cart -----
  const itemsById = useMemo(
    () => Object.fromEntries(ALL_MENU_ITEMS.map((i) => [i.id, i])),
    [],
  );
  const changeQty = (id: string, delta: number) =>
    setCart((prev) => {
      const qty = Math.max(0, (prev[id] || 0) + delta);
      const next = { ...prev };
      if (qty === 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  const cartItems: HomeCartItem[] = Object.entries(cart).map(
    ([id, quantity]) => {
      const item = itemsById[id];
      return {
        id,
        name: item.name,
        price: item.price,
        quantity,
        image: item.image,
      };
    },
  );
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cartItems.reduce((n, i) => n + i.quantity * i.price, 0);

  // ----- search / category -----
  const query = searchText.trim().toLowerCase();
  const searchResults = query
    ? ALL_MENU_ITEMS.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query),
      )
    : [];
  const category = MACNOSE_CATEGORIES.find((c) => c.id === selectedCategory);
  const categoryItems = selectedCategory
    ? MACNOSE_MENU[selectedCategory] || []
    : [];
  const categoryHasSections =
    new Set(categoryItems.map((x) => x.category)).size > 1;
  const featuredItems = FEATURED_IDS.map((id) => itemsById[id]).filter(Boolean);

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
        ? "Collect at Be Lounge · ready in 20 min"
        : "Grab a table at Be Lounge";

  const renderMenuRow = (item: MacnoseMenuItem) => {
    const qty = cart[item.id] || 0;
    return (
      <View key={item.id} style={styles.menuRow}>
        <Image source={item.image} style={styles.menuImage} />
        <View style={styles.menuInfo}>
          <Text style={styles.menuName} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.description && (
            <Text style={styles.menuDesc} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.menuPrice}>R{item.price}</Text>
        </View>
        {qty === 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => changeQty(item.id, 1)}
            accessibilityLabel={`Add ${item.name}`}
          >
            <Plus size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => changeQty(item.id, -1)}
              style={styles.stepBtn}
              accessibilityLabel="Remove one"
            >
              <Minus size={14} color={C.text} />
            </TouchableOpacity>
            <Text style={styles.stepQty}>{qty}</Text>
            <TouchableOpacity
              onPress={() => changeQty(item.id, 1)}
              style={styles.stepBtn}
              accessibilityLabel="Add one"
            >
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
          <Text style={styles.greeting}>
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </Text>
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
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLine}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onNotificationsPress}
          accessibilityLabel="Notifications"
        >
          <Bell size={20} color={C.text} />
          {unread > 0 && <View style={styles.bellDot} />}
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
          placeholder="Search mogodu, grills, drinks & more"
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
              {searchResults.length
                ? `Results for “${searchText.trim()}”`
                : "Nothing on the menu matches that"}
            </Text>
            {searchResults.map(renderMenuRow)}
          </View>
        ) : selectedCategory ? (
          <View style={styles.section}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={styles.iconBtn}
                accessibilityLabel="Back"
              >
                <ArrowLeft size={20} color={C.text} />
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>{category?.name}</Text>
            </View>
            {!!category?.note && (
              <Text style={styles.categoryNote}>{category.note}</Text>
            )}
            {categoryItems.map((item, i) => (
              <View key={item.id}>
                {/* Sub-heading when the menu section changes, e.g. Beers -> Ciders */}
                {categoryHasSections &&
                  (i === 0 ||
                    categoryItems[i - 1].category !== item.category) && (
                    <Text style={styles.subHeading}>{item.category}</Text>
                  )}
                {renderMenuRow(item)}
              </View>
            ))}
          </View>
        ) : (
          <>
            {/* Hero */}
            <View style={styles.heroWrap}>
              <Image
                source={require("../../assets/macnose/food.jpg")}
                style={styles.heroImage}
              />
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.15)",
                  "rgba(0,0,0,0.55)",
                  "rgba(0,0,0,0.95)",
                ]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroContent}>
                <Image
                  source={require("../../assets/belounge/logo.png")}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
                <Text style={styles.heroTitle}>
                  Good memories are made here.
                </Text>
                <Text style={styles.heroSub}>
                  South African classics, grills, seafood and premium drinks.
                  Order it to your door, or come through to the lounge.
                </Text>
                <View style={styles.heroCtas}>
                  <TouchableOpacity
                    style={styles.ctaPrimary}
                    onPress={() => {
                      setMode("delivery");
                      setSelectedCategory("specials");
                    }}
                  >
                    <Flame size={16} color={C.ember} />
                    <Text style={styles.ctaPrimaryText}>Order now</Text>
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
                      if (id === "delivery" && locStatus !== "ready")
                        refreshLocation();
                    }}
                    accessibilityState={{ selected: active }}
                  >
                    <Icon size={16} color={active ? "#FFFFFF" : C.text} />
                    <Text
                      style={[styles.modeText, active && { color: "#FFFFFF" }]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* What's on */}
            {events.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Music2 size={18} color={C.ember} />
                  <Text style={[styles.sectionTitle, { flex: 1 }]}>What's on</Text>
                  <TouchableOpacity onPress={onEventsPress} hitSlop={8}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                  style={{ marginHorizontal: -16 }}
                >
                  <View style={{ width: 4 }} />
                  {events.map((e) => {
                    const b = eventBadge(e);
                    return (
                      <TouchableOpacity
                        key={e.id}
                        style={styles.eventCard}
                        onPress={() => onEventPress?.(e.id)}
                        activeOpacity={0.85}
                      >
                        <Image source={e.image} style={styles.eventImage} />
                        <View style={styles.eventBadge}>
                          <Text style={styles.eventBadgeDow}>{b.dow}</Text>
                          <Text style={styles.eventBadgeDay}>{b.day}</Text>
                          <Text style={styles.eventBadgeMonth}>{b.month}</Text>
                        </View>
                        {isTonight(e) && (
                          <View style={styles.eventTonight}>
                            <Text style={styles.eventTonightText}>TONIGHT</Text>
                          </View>
                        )}
                        <View style={styles.eventBody}>
                          <Text style={styles.eventArtist} numberOfLines={1}>{e.artist}</Text>
                          <Text style={styles.eventMeta} numberOfLines={1}>
                            {e.title} · {e.startTime} · {formatEntry(e)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={{ width: 4 }} />
                </ScrollView>
              </View>
            )}

            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Flame size={18} color={C.ember} />
                <Text style={styles.sectionTitle}>The menu</Text>
              </View>
              <View style={styles.categoryGrid}>
                {MACNOSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryTile}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Image source={cat.image} style={styles.categoryImage} />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.85)"]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Promo carousel */}
            <View style={styles.section} onLayout={(ev) => setPromoWidth(ev.nativeEvent.layout.width - 32)}>
              {promoWidth > 0 && (
                <>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(ev) =>
                      setPromoIndex(Math.round(ev.nativeEvent.contentOffset.x / promoWidth))
                    }
                    onScroll={(ev) =>
                      setPromoIndex(Math.round(ev.nativeEvent.contentOffset.x / promoWidth))
                    }
                    scrollEventThrottle={64}
                  >
                    {PROMOS.map((promo) => (
                      <TouchableOpacity
                        key={promo.id}
                        style={[styles.promo, { width: promoWidth }]}
                        onPress={() => openPromo(promo)}
                        activeOpacity={0.9}
                      >
                        <Image source={promo.image} style={styles.promoImage} />
                        <LinearGradient
                          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.92)"]}
                          style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.promoBody}>
                          <Text style={styles.promoKicker}>{promo.kicker}</Text>
                          <Text style={styles.promoTitle}>{promo.title}</Text>
                          <Text style={styles.promoSub} numberOfLines={2}>{promo.sub}</Text>
                          <View style={styles.promoCta}>
                            <Text style={styles.promoCtaText}>{promo.cta}</Text>
                            <ChevronRight size={16} color={C.ember} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={styles.dots}>
                    {PROMOS.map((promo, i) => (
                      <View key={promo.id} style={[styles.dotPill, i === promoIndex && styles.dotPillActive]} />
                    ))}
                  </View>
                </>
              )}
            </View>

            {/* Start with these */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Flame size={18} color={C.ember} />
                <Text style={styles.sectionTitle}>Start with these</Text>
              </View>
              {featuredItems.map(renderMenuRow)}
            </View>

            {/* Visit us */}
            <View style={styles.section}>
              <View style={styles.visitCard}>
                <Image
                  source={require("../../assets/macnose/interior2.jpg")}
                  style={styles.visitImage}
                />
                <View style={styles.visitBody}>
                  <Text style={styles.visitKicker}>
                    LOUNGE & RESTAURANT
                  </Text>
                  <Text style={styles.visitTitle}>
                    “{MACNOSE_INFO.tagline}”
                  </Text>
                  <View style={styles.visitRow}>
                    <MapPin size={14} color={C.muted} />
                    <Text style={styles.visitText}>
                      {MACNOSE_RESTAURANT.address}
                    </Text>
                  </View>
                  <View style={styles.visitRow}>
                    <Clock size={14} color={C.muted} />
                    <Text style={styles.visitText}>
                      Open today {todaysHours()}
                    </Text>
                  </View>
                </View>
              </View>
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
              if (mode === "delivery" && locStatus !== "ready")
                refreshLocation();
              onCheckout?.(cartItems, mode);
            }}
            activeOpacity={0.9}
          >
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarText}>
              {mode === "delivery"
                ? "Deliver to me"
                : mode === "takeaway"
                  ? "Collect order"
                  : "Order to my table"}
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: { color: C.text, fontSize: 20, fontWeight: "700" },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  locationText: { color: C.muted, fontSize: 13, flexShrink: 1 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.ember,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15 },

  heroWrap: {
    marginHorizontal: 16,
    height: 300,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: 18 },
  heroLogo: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  heroTitle: {
    color: C.onImage,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroSub: { color: "#D4D4D4", fontSize: 14, marginTop: 4, lineHeight: 20 },
  heroCtas: { flexDirection: "row", gap: 10, marginTop: 14 },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF", // white on the dark hero, like the logo
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 999,
  },
  ctaPrimaryText: { color: C.ember, fontWeight: "700", fontSize: 14 },
  ctaGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 999,
  },
  ctaGhostText: { color: C.onImage, fontWeight: "600", fontSize: 14 },

  modeRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 4,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modeBtnActive: { backgroundColor: C.text },
  modeText: { color: C.text, fontWeight: "600", fontSize: 14 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: "700" },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryTile: {
    width: "48%",
    flexGrow: 1,
    height: 96,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  categoryImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  categoryName: {
    position: "absolute",
    left: 12,
    bottom: 10,
    color: C.onImage,
    fontSize: 15,
    fontWeight: "700",
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.ember,
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
  },
  bannerKicker: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    opacity: 0.8,
  },
  bannerTitle: { color: "#FFF", fontSize: 20, fontWeight: "800", marginTop: 2 },
  bannerSub: { color: "#FFF", fontSize: 13, marginTop: 4, opacity: 0.9 },
  bannerLink: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  bannerLinkText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  bannerImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: "#FFF",
  },

  seeAll: { color: C.emberText, fontSize: 14, fontWeight: "700" },

  eventCard: {
    width: 260, borderRadius: 18, overflow: "hidden",
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  eventImage: { width: "100%", height: 146 },
  eventBadge: {
    position: "absolute", top: 10, left: 10, width: 48, paddingVertical: 5,
    borderRadius: 12, backgroundColor: C.bg, alignItems: "center",
  },
  eventBadgeDow: { color: C.emberText, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  eventBadgeDay: { color: C.text, fontSize: 18, fontWeight: "800", lineHeight: 21 },
  eventBadgeMonth: { color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  eventTonight: {
    position: "absolute", top: 10, right: 10, backgroundColor: C.ember,
    borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3,
  },
  eventTonightText: { color: "#FFF", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  eventBody: { padding: 12 },
  eventArtist: { color: C.text, fontSize: 16, fontWeight: "800" },
  eventMeta: { color: C.muted, fontSize: 12, marginTop: 2 },

  promo: { height: 190, borderRadius: 20, overflow: "hidden", backgroundColor: C.text },
  promoImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  promoBody: { flex: 1, justifyContent: "flex-end", padding: 16 },
  promoKicker: { color: "#FFF", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, opacity: 0.85 },
  promoTitle: { color: "#FFF", fontSize: 22, fontWeight: "800", marginTop: 2 },
  promoSub: { color: "#E5E5E5", fontSize: 13, marginTop: 4, lineHeight: 18 },
  promoCta: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: 10,
    backgroundColor: "#FFFFFF", borderRadius: 999, paddingLeft: 12, paddingRight: 8, height: 32,
  },
  promoCtaText: { color: C.ember, fontWeight: "700", fontSize: 13 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
  dotPill: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.border },
  dotPillActive: { width: 18, backgroundColor: C.ember },

  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  categoryTitle: {
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
    flexShrink: 1,
  },
  categoryNote: {
    color: C.emberText,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  subHeading: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 8,
  },

  visitCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  visitImage: { width: "100%", height: 150 },
  visitBody: { padding: 14, gap: 6 },
  visitKicker: {
    color: C.emberText,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  visitTitle: { color: C.text, fontSize: 18, fontWeight: "800" },
  visitRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  visitText: { color: C.muted, fontSize: 13, flexShrink: 1 },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  menuImage: { width: 78, height: 78, borderRadius: 12 },
  menuInfo: { flex: 1 },
  menuName: { color: C.text, fontSize: 15, fontWeight: "700" },
  menuDesc: { color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  menuFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  menuPrice: { color: C.text, fontSize: 15, fontWeight: "800" },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.ember,
    justifyContent: "center",
    alignItems: "center",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.ember,
  },
  stepBtn: {
    width: 32,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  stepQty: {
    color: C.text,
    fontWeight: "800",
    minWidth: 16,
    textAlign: "center",
  },

  cartBarWrap: { position: "absolute", left: 16, right: 16, bottom: 16 },
  cartBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 58,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: C.ember,
    shadowColor: C.ember,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cartCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  cartCountText: { color: C.ember, fontWeight: "800" },
  cartBarText: { flex: 1, color: "#FFF", fontSize: 16, fontWeight: "800" },
  cartBarTotal: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
