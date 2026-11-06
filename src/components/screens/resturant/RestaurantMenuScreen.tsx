import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MenuItem, Restaurant, restaurantsApiService } from "../../../services/restaurants";

interface CartItem extends MenuItem {
  quantity: number;
}

interface RestaurantMenuScreenProps {
  restaurant: Restaurant;
  onBack: () => void;
  onCheckout: (cart: CartItem[]) => void;
}

export const RestaurantMenuScreen = ({ restaurant, onBack, onCheckout }: RestaurantMenuScreenProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = false; // Makhanani uses a fixed black & white theme

  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const cardBg = isDark ? "#262626" : "#FAFAFA";
  const subtitleText = isDark ? "#A3A3A3" : "#737373";
  const accentColor = isDark ? "#000000" : "#000000";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`RestaurantMenuScreen: Fetching menu for restaurant ${restaurant.id}`);
        
        const data = await restaurantsApiService.getRestaurantMenu(restaurant.id);
        
        if (Array.isArray(data)) {
          console.log(`RestaurantMenuScreen: Received ${data.length} menu items`);
          
          // Validate menu items have required fields
          const validMenuItems = data.filter(item => {
            if (!item.id || !item.name || item.price === undefined) {
              console.warn('Invalid menu item:', item);
              return false;
            }
            return true;
          });
          
          setMenu(validMenuItems);
          
          if (validMenuItems.length === 0 && data.length > 0) {
            setError('Some menu items are invalid');
          }
        } else {
          console.error('Menu data is not an array:', data);
          setError('Invalid menu data format');
          setMenu([]);
        }
      } catch (error) {
        console.error('RestaurantMenuScreen: Error fetching menu:', error);
        setError('Failed to load menu items. Please try again.');
        setMenu([]);
      } finally {
        setLoading(false);
      }
    };

    if (restaurant?.id) {
      fetchMenu();
    } else {
      setError('Restaurant information is missing');
      setLoading(false);
    }
  }, [restaurant.id]);

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(c => c.id === itemId);
    if (!existing) return;
    
    if (existing.quantity === 1) {
      setCart(cart.filter(c => c.id !== itemId));
    } else {
      setCart(cart.map(c => 
        c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      ));
    }
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "#404040" : "#E5E5E5" }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: text }]}>{restaurant.name}</Text>
          <Text style={[styles.headerSubtitle, { color: subtitleText }]}>
            {restaurant.delivery_time}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={[styles.centerContent, { backgroundColor: bg }]}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={[styles.loadingText, { color: subtitleText }]}>Loading menu...</Text>
        </View>
      ) : error ? (
        <View style={[styles.centerContent, { backgroundColor: bg }]}>
          <Text style={[styles.errorText, { color: '#000000' }]}>{error}</Text>
          <TouchableOpacity onPress={onBack}>
            <Text style={[styles.retryText, { color: accentColor }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : menu.length === 0 ? (
        <View style={[styles.centerContent, { backgroundColor: bg }]}>
          <Text style={[styles.emptyText, { color: subtitleText }]}>No menu items available</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={{ paddingBottom: cart.length > 0 ? 140 : 80 }}
        >
          {menu.map(item => {
            const cartItem = cart.find(c => c.id === item.id);
            const hasImage = typeof item.image === "number" || (typeof item.image === "string" && item.image.length > 0);
            
            return (
              <View key={item.id} style={[styles.menuCard, { backgroundColor: cardBg }]}>
                {/* Menu Item Image */}
                {hasImage ? (
                  <Image
                    source={typeof item.image === "number" ? item.image : { uri: item.image }}
                    style={styles.menuImage}
                    resizeMode="cover"
                    onError={(error) => {
                      console.warn(`Failed to load image for ${item.name}:`, error);
                    }}
                  />
                ) : (
                  <View style={[styles.menuImage, { backgroundColor: '#E5E5E5' }]}>
                    <Text style={{ color: subtitleText }}>No Image</Text>
                  </View>
                )}

                {/* Menu Item Info */}
                <View style={styles.menuInfo}>
                  <Text style={[styles.menuName, { color: text }]}>{item.name}</Text>
                  {item.description && (
                    <Text 
                      style={[styles.menuDesc, { color: subtitleText }]} 
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}
                  <Text style={[styles.menuPrice, { color: accentColor }]}>
                    R {item.price.toFixed(2)}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantityControls}>
                  {cartItem ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.qtyButton, { borderColor: accentColor }]} 
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Minus size={16} color={accentColor} />
                      </TouchableOpacity>
                      <Text style={[styles.quantityText, { color: text }]}>
                        {cartItem.quantity}
                      </Text>
                      <TouchableOpacity 
                        style={[styles.qtyButton, { borderColor: accentColor }]} 
                        onPress={() => addToCart(item)}
                      >
                        <Plus size={16} color={accentColor} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.addButton, { backgroundColor: accentColor }]} 
                      onPress={() => addToCart(item)}
                    >
                      <Plus size={16} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Cart Footer */}
      {cart.length > 0 && (
        <View style={[styles.cartFooter, { backgroundColor: bg, borderTopColor: isDark ? "#404040" : "#E5E5E5" }]}>
          <TouchableOpacity 
            style={[styles.checkoutButton, { backgroundColor: accentColor }]} 
            onPress={() => onCheckout(cart)}
          >
            <ShoppingCart size={20} color="#FFFFFF" />
            <View style={styles.checkoutTextContainer}>
              <Text style={styles.checkoutText}>View Cart ({cart.length})</Text>
              <Text style={styles.checkoutPrice}>R {getTotal().toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 16, 
    borderBottomWidth: 1 
  },
  backButton: { 
    marginRight: 16 
  },
  headerContent: { 
    flex: 1 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold" 
  },
  headerSubtitle: { 
    fontSize: 14, 
    marginTop: 2 
  },
  content: { 
    flex: 1, 
    padding: 16 
  },
  centerContent: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16 
  },
  errorText: { 
    fontSize: 16, 
    marginBottom: 16,
    textAlign: 'center'
  },
  retryText: { 
    fontSize: 16, 
    marginTop: 12, 
    fontWeight: "600" 
  },
  emptyText: { 
    fontSize: 16 
  },
  menuCard: { 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 12, 
    shadowColor: "#000000", 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 5 },
    elevation: 3
  },
  menuImage: { 
    width: '100%',
    height: 160, 
    borderRadius: 12, 
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuInfo: { 
    marginBottom: 12 
  },
  menuName: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 4 
  },
  menuDesc: { 
    fontSize: 14, 
    marginBottom: 8 
  },
  menuPrice: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  quantityControls: { 
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: 'flex-end'
  },
  qtyButton: { 
    borderWidth: 1, 
    borderRadius: 6, 
    padding: 8, 
    marginHorizontal: 8 
  },
  quantityText: { 
    fontSize: 16, 
    fontWeight: "600",
    minWidth: 30,
    textAlign: 'center'
  },
  addButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    justifyContent: "center" 
  },
  addButtonText: { 
    color: "#FFFFFF", 
    fontSize: 14, 
    fontWeight: "600", 
    marginLeft: 6 
  },
  cartFooter: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 16, 
    borderTopWidth: 1 
  },
  checkoutButton: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 16, 
    paddingHorizontal: 20, 
    borderRadius: 12 
  },
  checkoutTextContainer: { 
    flex: 1, 
    marginLeft: 12 
  },
  checkoutText: { 
    color: "#FFFFFF", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  checkoutPrice: { 
    color: "#FFFFFF", 
    fontSize: 14, 
    fontWeight: "600", 
    marginTop: 4 
  },
});