import { ArrowLeft, Bell, Heart, MapPin, ShoppingCart, Star } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { SpecialOffersCarousel } from "./SpecialOffersScreen";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: any;
  rating: number;
  description: string;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  image: any;
}

// Mock menu categories - Flavor Hospitality signature items
const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: "chicken-prego",
    name: "Chicken Prego",
    icon: "🍗",
    image: require("../../assets/images/Flavor-Hospitality_Chicken-Prego-480x408.png"),
  },
  {
    id: "wings",
    name: "Chicken Wings",
    icon: "🍖",
    image: require("../../assets/images/Flavor-Hospitality_Chicken-Wings-with-chips-480x408.png"),
  },
  {
    id: "salads",
    name: "Salads & Buffet",
    icon: "🥗",
    image: require("../../assets/images/Flavor-Hospitality_Buffet-salads-480x480.png"),
  },
  {
    id: "platter",
    name: "Platters",
    icon: "🍽️",
    image: require("../../assets/images/Flavor-Hospitality_Platter-480x480.png"),
  },
  {
    id: "sandwich",
    name: "Sandwiches",
    icon: "🥪",
    image: require("../../assets/images/Flavor-Hospitality_Sandwich-480x625.png"),
  },
  {
    id: "wraps",
    name: "Wraps",
    icon: "🌯",
    image: require("../../assets/images/Flavor-Hospitality_Wrap-480x625.png"),
  },
];

// Mock menu items for each category
const MOCK_MENU_ITEMS: { [key: string]: MenuItem[] } = {
  "chicken-prego": [
    {
      id: "prego-1",
      name: "Classic Chicken Prego",
      category: "Chicken Prego",
      price: 85,
      image: require("../../assets/images/Flavor-Hospitality_Chicken-Prego-980x833.png"),
      rating: 4.8,
      description: "Tender grilled chicken breast on fresh bread with special prego sauce",
    },
    {
      id: "prego-2",
      name: "Spicy Prego",
      category: "Chicken Prego",
      price: 95,
      image: require("../../assets/images/Flavor-Hospitality_Chicken-Prego-480x408.png"),
      rating: 4.7,
      description: "Hot and spicy grilled chicken with extra sauce",
    },
  ],
  "wings": [
    {
      id: "wings-1",
      name: "Chicken Wings with Chips",
      category: "Chicken Wings",
      price: 120,
      image: require("../../assets/images/Flavor-Hospitality_Chicken-Wings-with-chips-980x833.png"),
      rating: 4.9,
      description: "Crispy wings served with golden chips and coleslaw",
    },
    {
      id: "wings-2",
      name: "Wings Combo",
      category: "Chicken Wings",
      price: 150,
      image: require("../../assets/images/Flavor-Hospitality_Chicken-Wings-with-chips-480x408.png"),
      rating: 4.8,
      description: "Mixed wings with chips and drink",
    },
  ],
  "salads": [
    {
      id: "salad-1",
      name: "Buffet Salad Mix",
      category: "Salads & Buffet",
      price: 75,
      image: require("../../assets/images/Flavor-Hospitality_Buffet-salads.png"),
      rating: 4.6,
      description: "Fresh mixed salad with Flavor Hospitality special dressing",
    },
    {
      id: "salad-2",
      name: "Chicken Salad",
      category: "Salads & Buffet",
      price: 95,
      image: require("../../assets/images/Flavor-HospitalityChicken-Salad-980x833.png"),
      rating: 4.7,
      description: "Grilled chicken on fresh greens with vinaigrette",
    },
  ],
  "platter": [
    {
      id: "platter-1",
      name: "Flavor Platter",
      category: "Platters",
      price: 180,
      image: require("../../assets/images/Flavor-Hospitality_Platter.png"),
      rating: 4.9,
      description: "Complete meal with chicken, salad, chips and bread",
    },
  ],
  "sandwich": [
    {
      id: "sandwich-1",
      name: "Gourmet Sandwich",
      category: "Sandwiches",
      price: 75,
      image: require("../../assets/images/Flavor-Hospitality_Sandwich.png"),
      rating: 4.7,
      description: "Premium sandwich with fresh ingredients and special sauce",
    },
  ],
  "wraps": [
    {
      id: "wraps-1",
      name: "Chicken Wrap",
      category: "Wraps",
      price: 80,
      image: require("../../assets/images/Flavor-Hospitality_Wrap.png"),
      rating: 4.8,
      description: "Seasoned chicken wrapped in fresh tortilla with veggies",
    },
  ],
};

interface HomeScreenProps {
  onFeatureSelect: (feature: string) => void;
  onNavigateToMap: () => void;
  onFoodCategorySelect: (input: string) => void;
  onProfilePress: () => void;
  onNotificationsPress: () => void;
}

export const HomeScreen = ({
  onFeatureSelect,
  onNavigateToMap,
  onFoodCategorySelect,
  onProfilePress,
  onNotificationsPress,
}: HomeScreenProps) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const bg = isDark ? "#05070A" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#0F172A";
  const subtitleText = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#1F2937" : "#F9FAFB";
  const accentColor = isDark ? "#F59E0B" : "#F59E0B";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleBackFromItems = () => {
    setSelectedCategory(null);
  };

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  const currentMenuItems = selectedCategory ? MOCK_MENU_ITEMS[selectedCategory] || [] : [];

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: subtitleText }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: text }]}>
              Guest
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: cardBg }]}
              onPress={onNotificationsPress}
            >
              <Bell size={20} color={accentColor} strokeWidth={2} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: cardBg }]}
              onPress={onProfilePress}
            >
              <Image
                source={require("../../assets/images/Flavor-FB-Icon.png")}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.locationBar, { backgroundColor: cardBg }]}>
          <MapPin size={16} color={accentColor} />
          <Text style={[styles.locationText, { color: text }]}>Flavor Hospitality Area</Text>
          <Text style={[styles.deliveryTime, { color: subtitleText }]}>12-20 mins</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor }]}>
          <TextInput
            style={[styles.searchInput, { color: text }]}
            placeholder="Search meals..."
            placeholderTextColor={subtitleText}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: accentColor }]}
          onPress={() => {
            if (cartCount > 0) {
              onFeatureSelect("checkout");
            } else {
              alert("Add items to cart first!");
            }
          }}
        >
          <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedCategory === null ? (
          <>
            {/* Logo */}
            <View style={styles.logoSection}>
              <Image
                source={require("../../assets/images/Flavor-Logo-New-No-Glow-1-e1779706388288.png")}
                style={styles.flavorLogo}
                resizeMode="contain"
              />
            </View>

            {/* Special Offers Carousel */}
            <View style={[styles.section, { paddingHorizontal: 0 }]}>
              <SpecialOffersCarousel
                onOfferPress={(offer) => {
                  alert(`${offer.title}\n\n${offer.description}\n\nValid: ${offer.validOn}`);
                }}
              />
            </View>

            {/* Browse Categories Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: text }]}>
                Browse Menu
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {MOCK_CATEGORIES.map((category, index) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: cardBg, borderColor },
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={category.image}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                    <Text
                      style={[styles.categoryName, { color: text }]}
                      numberOfLines={2}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Featured Banner */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.bannerCard,
                  { backgroundColor: accentColor },
                ]}
                onPress={() => handleCategorySelect("chicken-prego")}
              >
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>Special Offer</Text>
                  <Text style={styles.bannerSubtitle}>
                    Chicken Prego
                  </Text>
                  <Text style={styles.bannerPrice}>From R85</Text>
                </View>
                <Image
                  source={require("../../assets/images/Flavor-Hospitality_Chicken-Prego-480x408.png")}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>

            {/* Popular Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: text }]}>
                  Popular Items
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAll, { color: accentColor }]}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              {[
                MOCK_MENU_ITEMS["chicken-prego"][0],
                MOCK_MENU_ITEMS["wings"][0],
                MOCK_MENU_ITEMS["salads"][0],
              ].map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.menuItemCard,
                    { backgroundColor: cardBg, borderColor },
                  ]}
                >
                  <Image
                    source={item.image}
                    style={styles.menuItemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.menuItemInfo}>
                    <Text style={[styles.itemName, { color: text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.itemDescription, { color: subtitleText }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                    <View style={styles.itemFooter}>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text style={[styles.rating, { color: text }]}>
                          {item.rating}
                        </Text>
                      </View>
                      <Text style={[styles.price, { color: accentColor }]}>
                        R{item.price}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(item.id)}
                  >
                    <Heart
                      size={20}
                      color={
                        favorites.has(item.id) ? accentColor : borderColor
                      }
                      fill={favorites.has(item.id) ? accentColor : "none"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Category Items View */}
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackFromItems}
              >
                <ArrowLeft size={24} color={text} />
              </TouchableOpacity>
              <Text style={[styles.categoryTitle, { color: text }]}>
                {
                  MOCK_CATEGORIES.find((cat) => cat.id === selectedCategory)
                    ?.name
                }
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {currentMenuItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.menuItemCard,
                  { backgroundColor: cardBg, borderColor },
                ]}
              >
                <Image
                  source={item.image}
                  style={styles.menuItemImage}
                  resizeMode="cover"
                />
                <View style={styles.menuItemInfo}>
                  <Text style={[styles.itemName, { color: text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.itemDescription,
                      { color: subtitleText },
                    ]}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                  <View style={styles.itemFooter}>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.rating, { color: text }]}>
                        {item.rating}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: accentColor }]}
                      onPress={addToCart}
                    >
                      <Text style={styles.addButtonText}>
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.price, { color: accentColor }]}>
                    R{item.price}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Heart
                    size={20}
                    color={favorites.has(item.id) ? accentColor : borderColor}
                    fill={favorites.has(item.id) ? accentColor : "none"}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  deliveryTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  searchInput: {
    fontSize: 14,
    flex: 1,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  logoSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  flavorLogo: {
    width: 120,
    height: 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoriesScroll: {
    gap: 12,
  },
  categoryCard: {
    width: 130,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  categoryImage: {
    width: "100%",
    height: 120,
  },
  categoryName: {
    padding: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  bannerCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
    alignItems: "center",
    minHeight: 140,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
  },
  bannerSubtitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  bannerPrice: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  bannerImage: {
    width: 100,
    height: 100,
  },
  menuItemCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
  },
  menuItemImage: {
    width: 100,
    height: 100,
  },
  menuItemInfo: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  favoriteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  backButton: {
    padding: 8,
  },
});