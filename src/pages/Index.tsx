// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { MobileContainer } from "../components/MobileContainer";
import type { BookingData as CheckoutBookingData } from "../components/screens/CheckoutScreen";
import { Order } from "../services/orders";
import { Restaurant } from "../services/restaurants";

import { ActiveOrdersScreen } from "../components/screens/ActiveOrdersScreen";
import { BuyForMeScreen } from "../components/screens/BuyForMeScreen";
import { DeliveryCompleteScreen } from "../components/screens/DeliveryCompleteScreen";
import { DriverFoundScreen } from "../components/screens/DriverFoundScreen";
import { EmergencyDeliveryScreen } from "../components/screens/EmergencyDeliveryScreen";
import { FetchFromHomeScreen } from "../components/screens/FetchFromHomeScreen";
import { FindingDriverScreen } from "../components/screens/FindingDriverScreen";
import { HomeScreen } from "../components/screens/HomeScreen";
import { LoginScreen } from "../components/screens/LoginScreen";
import { NotificationScreen } from "../components/screens/NotificationScreen";
import { OnboardingScreen } from "../components/screens/OnboardingScreen";
import { OrderHistoryScreen } from "../components/screens/OrderHistoryScreen";
import { PickupDropoffScreen } from "../components/screens/PickupDropoffScreen";
import { PriceSummaryScreen } from "../components/screens/PriceSummaryScreen";
import { EditProfileScreen } from "../components/screens/profile/EditProfileScreen";
import { ProfileScreen } from "../components/screens/profile/ProfileScreen";
import { SavedAddressesScreen } from "../components/screens/profile/SavedAddressesScreen";
import { SettingsScreen } from "../components/screens/profile/SettingsScreen";
import { SupportScreen } from "../components/screens/profile/SupportScreen";
import { CheckoutScreen } from "../components/screens/CheckoutScreen";
import { RestaurantMenuScreen } from "../components/screens/resturant/RestaurantMenuScreen";
import { RestaurantsListScreen } from "../components/screens/resturant/RestaurantsListScreen";
import RiderMapScreen from "../components/screens/Riders/RiderMapScreen";
import { SendPackageScreen } from "../components/screens/SendPackageScreen";
import { SplashScreen } from "../components/screens/SplashScreen";
import { TrackingScreen } from "../components/screens/TrackingScreen";
import { PaymentScreen } from "../components/screens/PaymentScreen";
import { DriverTrackingScreen } from "../components/screens/DriverTrackingScreen";

// Types
type Screen =
  | "splash"
  | "onboarding"
  | "login"
  | "home"
  | "restaurantDetail"
  | "restaurantMenu"
  | "checkout"
  | "payment"
  | "driverTracking"
  | "findingDriver"
  | "driverFound"
  | "orderHistory"
  | "activeOrders"
  | "fetch"
  | "pickup"
  | "buy"
  | "send"
  | "emergency"
  | "price"
  | "tracking"
  | "complete"
  | "riderMap"
  | "profile"
  | "editProfile"
  | "savedAddresses"
  | "settings"
  | "support"
  | "notifications";

interface OrderData {
  orderId: string;
  deliveryCode: string;
  deliveryQrCode: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
}

interface RiderInfo {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

// Using Restaurant type from services/restaurants.ts
// The API returns snake_case fields like delivery_time

interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

type BookingData = CheckoutBookingData;

interface PaymentData {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  bookingData: BookingData;
  timestamp: string;
  deliveryCode?: string;
  orderId?: number;
}

const ONBOARDING_KEY = "onboardingSeen";

export default function Index() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<"delivery" | "sitin" | "takeaway">("delivery");
  const [currentOrderData, setCurrentOrderData] = useState<OrderData | null>(null);
  const [currentRider, setCurrentRider] = useState<RiderInfo | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [currentBookingData, setCurrentBookingData] = useState<BookingData | null>(null);
  const [currentPaymentData, setCurrentPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentScreen("home");
      } else {
        setCurrentScreen("splash");
      }
    }
  }, [user, loading]);

  const renderScreen = () => {
    // Show loading state while auth is being determined
    if (loading) {
      return (
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (currentScreen) {
      case "splash":
        return (
          <SplashScreen
            onComplete={async () => {
              let seen = false;
              try {
                seen = (await AsyncStorage.getItem(ONBOARDING_KEY)) === "1";
              } catch {}
              setCurrentScreen(seen ? "login" : "onboarding");
            }}
          />
        );

      case "onboarding":
        return (
          <OnboardingScreen
            onComplete={() => {
              AsyncStorage.setItem(ONBOARDING_KEY, "1").catch(() => {});
              setCurrentScreen("login");
            }}
          />
        );

      case "login":
        return <LoginScreen />;

      case "home":
  return (
    <HomeScreen
      onFeatureSelect={(feature) => {
        const map: Record<string, Screen> = {
          buyforme: "buy",
          pickup: "pickup",
          buy: "buy",
          send: "send",
          fetch: "fetch",
          emergency: "emergency",
          track: "activeOrders",
          checkout: "checkout",
        };
        setCurrentScreen(map[feature] || "home");
      }}
      onNavigateToMap={() => setCurrentScreen("riderMap")}

      initialCart={cart}
      initialMode={checkoutMode}
      onCheckout={(items, mode) => {
        setCart(items);
        setCheckoutMode(mode);
        setCurrentScreen("checkout");
      }}

      onFoodCategorySelect={() => {}}
      onProfilePress={() => setCurrentScreen("profile")}
      onNotificationsPress={() => setCurrentScreen("notifications")}
    />
  );


      case "restaurantDetail":
        // RestaurantsListScreen now shows detail view for a single restaurant
        return selectedRestaurant ? (
          <RestaurantsListScreen
            restaurant={selectedRestaurant as any}
            onBack={() => {
              setSelectedRestaurant(null);
              setCurrentScreen("home");
            }}
            onRestaurantSelect={(restaurant: any) => {
              // When clicking "View Menu / Order"
              console.log("Going to menu for:", restaurant.name);
              setSelectedRestaurant(restaurant);
              setCurrentScreen("restaurantMenu");
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No restaurant selected</Text>
          </View>
        );

      case "restaurantMenu":
        return selectedRestaurant ? (
          <RestaurantMenuScreen
            restaurant={selectedRestaurant as any}
            onBack={() => setCurrentScreen("restaurantDetail")}
            onCheckout={(cartItems) => {
              console.log("View Cart clicked, cart items:", cartItems.length);
              setCart(cartItems);
              // selectedRestaurant is already set, no need to update
              setCurrentScreen("checkout");
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No restaurant selected</Text>
          </View>
        );

      case "checkout":
        // New checkout screen with booking types and payment
        const mockCartItems = cart;
        const totalPrice = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        return (
          <View style={styles.checkoutWrapper}>
            <CheckoutScreen
              cartItems={mockCartItems}
              totalPrice={totalPrice}
              initialBookingType={checkoutMode}
              onBack={() => {
                setCurrentScreen(selectedRestaurant ? "restaurantMenu" : "home");
              }}
              onPayment={(bookingData) => {
                setCurrentBookingData(bookingData);
                setCurrentScreen("payment");
              }}
            />
          </View>
        );

      case "payment":
        return currentBookingData ? (
          <PaymentScreen
            bookingData={currentBookingData}
            onBack={() => setCurrentScreen("checkout")}
            onDone={() => {
              setCart([]);
              setCurrentBookingData(null);
              setCurrentScreen("home");
            }}
            onPaymentSuccess={(paymentData) => {
              setCurrentPaymentData(paymentData);
              setCurrentScreen("driverTracking");
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No booking data available</Text>
          </View>
        );

      case "driverTracking":
        return currentPaymentData ? (
          <DriverTrackingScreen
            paymentData={currentPaymentData}
            onOrderComplete={() => {
              setCart([]);
              setSelectedRestaurant(null);
              setCurrentBookingData(null);
              setCurrentPaymentData(null);
              setCurrentScreen("home");
            }}
            onCancel={() => {
              setCurrentPaymentData(null);
              setCurrentScreen("home");
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No payment data available</Text>
          </View>
        );

      case "findingDriver":
        return currentOrderData ? (
          <FindingDriverScreen
            orderId={currentOrderData.orderId}
            deliveryAddress={currentOrderData.deliveryAddress}
            deliveryLatitude={currentOrderData.deliveryLatitude}
            deliveryLongitude={currentOrderData.deliveryLongitude}
            onDriverFound={(riderInfo) => {
              setCurrentRider(riderInfo);
              setCurrentScreen("driverFound");
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No order data available</Text>
          </View>
        );

      case "driverFound":
        return currentOrderData && currentRider ? (
          <DriverFoundScreen
            rider={currentRider}
            orderId={currentOrderData.orderId}
            deliveryAddress={currentOrderData.deliveryAddress}
            deliveryLatitude={currentOrderData.deliveryLatitude}
            deliveryLongitude={currentOrderData.deliveryLongitude}
            onContinueToTracking={() => {
              setCurrentScreen("tracking");
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No driver information available</Text>
          </View>
        );

      case "orderHistory":
        return (
          <OrderHistoryScreen
            onBack={() => setCurrentScreen("profile")}
            onTrackOrder={(orderId) => {
              setCurrentOrderData({
                orderId,
                deliveryCode: '',
                deliveryQrCode: '',
                deliveryAddress: '',
                deliveryLatitude: 0,
                deliveryLongitude: 0,
              });
              setSelectedTrackingOrder(null);
              setCurrentScreen("tracking");
            }}
          />
        );

      case "activeOrders":
        return (
          <ActiveOrdersScreen
            onBack={() => setCurrentScreen("home")}
            onTrackOrder={(orderId, order) => {
              setCurrentOrderData({
                orderId,
                deliveryCode: order.delivery_code || '',
                deliveryQrCode: order.delivery_qr_code || '',
                deliveryAddress: order.delivery_address || '',
                deliveryLatitude: parseFloat(String(order.delivery_latitude || order.delivery_lat)) || 0,
                deliveryLongitude: parseFloat(String(order.delivery_longitude || order.delivery_lng)) || 0,
              });
              setSelectedTrackingOrder(order);
              setCurrentScreen("tracking");
            }}
          />
        );

      case "riderMap":
        return <RiderMapScreen onBack={() => setCurrentScreen("home")} />;

      case "pickup":
        return <PickupDropoffScreen onBack={() => setCurrentScreen("home")} onContinue={() => setCurrentScreen("price")} />;

      case "buy":
        return <BuyForMeScreen onBack={() => setCurrentScreen("home")} onContinue={() => setCurrentScreen("price")} />;

      case "send":
        return <SendPackageScreen onBack={() => setCurrentScreen("home")} onContinue={() => setCurrentScreen("price")} />;

      case "fetch":
        return <FetchFromHomeScreen onBack={() => setCurrentScreen("home")} onContinue={() => setCurrentScreen("price")} />;

      case "emergency":
        return <EmergencyDeliveryScreen onBack={() => setCurrentScreen("home")} onContinue={() => setCurrentScreen("price")} />;

      case "price":
        return <PriceSummaryScreen onBack={() => setCurrentScreen("home")} onConfirm={() => setCurrentScreen("tracking")} />;

      case "tracking":
        return (
          <TrackingScreen
            onBack={() => {
              setCurrentOrderData(null);
              setCurrentRider(null);
              setSelectedTrackingOrder(null);
              setCurrentScreen("home");
            }}
            onComplete={() => {
              setCurrentOrderData(null);
              setCurrentRider(null);
              setSelectedTrackingOrder(null);
              setCurrentScreen("complete");
            }}
            orderId={currentOrderData?.orderId}
            orderData={selectedTrackingOrder || undefined}
          />
        );

      case "complete":
        return <DeliveryCompleteScreen onDone={() => setCurrentScreen("home")} />;

      case "profile":
        return <ProfileScreen
          onBack={() => setCurrentScreen("home")}
          onNavigateToEditProfile={() => setCurrentScreen("editProfile")}
          onNavigateToSavedAddresses={() => setCurrentScreen("savedAddresses")}
          onNavigateToSettings={() => setCurrentScreen("settings")}
          onNavigateToSupport={() => setCurrentScreen("support")}
          onNavigateToOrderHistory={() => setCurrentScreen("orderHistory")}
        />;

      case "editProfile":
        return <EditProfileScreen onBack={() => setCurrentScreen("profile")} />;

      case "savedAddresses":
        return <SavedAddressesScreen onBack={() => setCurrentScreen("profile")} />;

      case "settings":
        return <SettingsScreen onBack={() => setCurrentScreen("profile")} />;

      case "support":
        return <SupportScreen onBack={() => setCurrentScreen("profile")} />;

      case "notifications":
        return <NotificationScreen onBack={() => setCurrentScreen("home")} />;

      default:
        return null;
    }
  };

  return (
    <MobileContainer>
      <View style={styles.root}>{renderScreen()}</View>
    </MobileContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  checkoutWrapper: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
  },
});