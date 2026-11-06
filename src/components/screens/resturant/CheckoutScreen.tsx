// ============================================
// CheckoutScreen.tsx (WebView Redirect Handling)
// ============================================
import usersApiService from "@/src/services/users";
import { ArrowLeft, CreditCard, MapPin, Minus, Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from 'react-native-webview';
import { useAuth } from '../../../auth/AuthContext';
import { ordersApiService } from '../../../services/orders';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  delivery_time?: string;
  deliveryTime?: string;
  distance: string;
  category: string;
  emoji: string;
}

interface OrderCompleteData {
  orderId: string;
  deliveryCode: string;
  deliveryQrCode: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
}

interface CheckoutScreenProps {
  cart: CartItem[];
  restaurant: Restaurant;
  onBack: () => void;
  onOrderComplete: (data?: OrderCompleteData) => void;
  onFindDriver?: (data: OrderCompleteData) => void;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
}

export const CheckoutScreen = ({
  cart,
  restaurant,
  onBack,
  onOrderComplete,
  onFindDriver,
  deliveryAddress,
  deliveryLatitude,
  deliveryLongitude
}: CheckoutScreenProps) => {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState<string>('');
  const [deliveryQrCode, setDeliveryQrCode] = useState<string>('');
  const [showPaystack, setShowPaystack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const isDark = false; // Makhanani uses a fixed black & white theme
  const { user } = useAuth();
  const [localCart, setLocalCart] = useState(cart);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [lastNavigatedUrl, setLastNavigatedUrl] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const webviewRef = useRef<WebView>(null);

  // Callback URLs - update these to match your backend
  const CALLBACK_URL = 'https://yourapp.com/payment/success';
  const CANCEL_URL = 'https://yourapp.com/payment/cancel';

  // Reset payment state for retry
  const resetPaymentState = () => {
    setPaymentProcessed(false);
    setLastNavigatedUrl('');
    setPaymentUrl('');
    setPaymentReference('');
  };

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const addresses = await usersApiService.getUserAddresses();
        setSavedAddresses(addresses);
        if (!deliveryAddress && addresses.length > 0) {
          setSelectedAddress(addresses[0]);
        }
      } catch (error) {
        console.error('Error fetching saved addresses:', error);
      }
    };

    fetchSavedAddresses();
  }, [deliveryAddress]);

  // Auto-trigger find driver when order is placed successfully
  useEffect(() => {
    if (orderPlaced && onFindDriver && orderId) {
      // Small delay to allow user to see the confirmation briefly
      const timer = setTimeout(() => {
        handleFindDriver();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [orderPlaced, orderId]);

  const increaseQuantity = (itemId: string) => {
    setLocalCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (itemId: string) => {
    setLocalCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const cardBg = isDark ? "#262626" : "#FAFAFA";
  const subtitleText = isDark ? "#A3A3A3" : "#737373";
  const accentColor = isDark ? "#000000" : "#000000";

  const subtotal = localCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 15;
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to place an order');
      return;
    }

    const finalAddress = selectedAddress || {
      address: deliveryAddress,
      latitude: deliveryLatitude,
      longitude: deliveryLongitude
    };

    if (!finalAddress.address || finalAddress.latitude === undefined || finalAddress.longitude === undefined) {
      Alert.alert('Error', 'Delivery address with coordinates is required');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.uid,
        restaurant_id: parseInt(restaurant.id),
        total_amount: total,
        delivery_fee: deliveryFee,
        delivery_address: finalAddress.address,
        delivery_latitude: parseFloat(finalAddress.latitude.toString()),
        delivery_longitude: parseFloat(finalAddress.longitude.toString()),
        special_instructions: '',
        items: localCart.map(item => ({
          menu_item_id: parseInt(item.id),
          quantity: parseInt(item.quantity.toString()),
          price: parseFloat(item.price.toString()),
        })),
      };

      console.log('Order data being sent:', JSON.stringify(orderData, null, 2));

      const response = await ordersApiService.createOrder(orderData);
      setOrderId(response.id.toString());
      setDeliveryCode(response.delivery_code);
      setDeliveryQrCode(response.delivery_qr_code);

      // Initialize Paystack payment and get the authorization URL
      const paymentResponse = await ordersApiService.initializePayment({
        order_id: response.id,
        email: user.email || '',
        amount: total * 100, // Amount in kobo
        callback_url: CALLBACK_URL,
      });

      setPaymentUrl(paymentResponse.authorization_url);
      setPaymentReference(paymentResponse.reference); // Store reference for verification
      setShowPaystack(true);
    } catch (error: any) {
      console.error('Error creating order:', {
        message: error.message,
        status: error.response?.status,
        errorData: error.response?.data,
      });
      Alert.alert(
        'Order Error', 
        error.response?.data?.message || 'Failed to create order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = async (state: any) => {
    const { url } = state;

    if (!url || url === lastNavigatedUrl) return;

    setLastNavigatedUrl(url);
    console.log('WebView navigated to:', url);

    // Prevent duplicate processing
    if (paymentProcessed) return;

    // Handle successful payment - check for callback URL or Paystack success indicators
    const isPaymentSuccess =
      url.startsWith(CALLBACK_URL) ||
      url.includes('trxref=') ||
      url.includes('reference=');

    if (isPaymentSuccess) {
      setPaymentProcessed(true);
      try {
        console.log('Payment successful, verifying transaction...');

        // Extract reference from URL - Paystack uses both 'reference' and 'trxref' params
        let reference = '';
        try {
          const urlParts = url.split('?');
          if (urlParts.length > 1) {
            const urlParams = new URLSearchParams(urlParts[1]);
            reference = urlParams.get('reference') || urlParams.get('trxref') || '';
          }
        } catch (e) {
          console.warn('Could not parse URL params:', e);
        }

        // Use extracted reference or fall back to stored reference
        const verifyReference = reference || paymentReference;

        // Verify payment on backend
        if (orderId && verifyReference) {
          await ordersApiService.verifyPayment(parseInt(orderId, 10), verifyReference);
          setShowPaystack(false);
          setOrderPlaced(true);
        } else {
          console.warn('No reference available for verification');
          Alert.alert('Warning', 'Payment completed but could not verify. Please contact support if your order is not confirmed.');
          setShowPaystack(false);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        Alert.alert('Verification Error', 'Payment successful but verification failed. Please contact support.');
        setShowPaystack(false);
      }
    }

    // Handle payment cancellation
    if (url === CANCEL_URL || url.includes('status=cancelled') || url.includes('cancelled=true')) {
      console.log('Payment cancelled by user');
      setShowPaystack(false);
      resetPaymentState();
      Alert.alert('Payment Cancelled', 'Your payment has been cancelled. Your order remains unpaid.');
    }
  };

  // Build order complete data for navigation
  const getOrderCompleteData = (): OrderCompleteData => {
    const finalAddress = selectedAddress || {
      address: deliveryAddress || '',
      latitude: deliveryLatitude || 0,
      longitude: deliveryLongitude || 0
    };

    return {
      orderId,
      deliveryCode,
      deliveryQrCode,
      deliveryAddress: finalAddress.address,
      deliveryLatitude: parseFloat(finalAddress.latitude?.toString() || '0'),
      deliveryLongitude: parseFloat(finalAddress.longitude?.toString() || '0'),
    };
  };

  const handleFindDriver = () => {
    const data = getOrderCompleteData();
    if (onFindDriver) {
      onFindDriver(data);
    }
  };

  const handleGoHome = () => {
    const data = getOrderCompleteData();
    onOrderComplete(data);
  };

  if (orderPlaced) {
    return (
      <View style={[styles.container, { backgroundColor: bg, justifyContent: "center", alignItems: "center" }]}>
        <View style={[styles.successCard, { backgroundColor: cardBg }]}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={[styles.successTitle, { color: text }]}>Order Confirmed!</Text>
          <Text style={[styles.successText, { color: subtitleText }]}>
            Your {restaurant.name} order will arrive in {restaurant.delivery_time || restaurant.deliveryTime || '30-45 min'}
          </Text>
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.deliveryCodeTitle, { color: text }]}>Delivery Code</Text>
            <Text style={[styles.deliveryCode, { color: accentColor }]}>{deliveryCode}</Text>
            {deliveryQrCode && (
              <View style={styles.qrContainer}>
                <Text style={[styles.qrText, { color: subtitleText }]}>Scan QR Code for Delivery</Text>
              </View>
            )}
          </View>

          {/* Find Driver Button - Primary Action */}
          {onFindDriver && (
            <TouchableOpacity
              onPress={handleFindDriver}
              style={[styles.findDriverButton, { backgroundColor: accentColor }]}
            >
              <Text style={styles.findDriverButtonText}>Find a Driver</Text>
            </TouchableOpacity>
          )}

          {/* Back to Home Button */}
          <TouchableOpacity
            onPress={handleGoHome}
            style={[styles.homeButton, { backgroundColor: onFindDriver ? 'transparent' : accentColor, borderWidth: onFindDriver ? 1 : 0, borderColor: accentColor }]}
          >
            <Text style={[styles.homeButtonText, { color: onFindDriver ? accentColor : '#FFFFFF' }]}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Paystack WebView Modal */}
      <Modal visible={showPaystack} animationType="slide" onRequestClose={() => { setShowPaystack(false); resetPaymentState(); }}>
        <View style={{ flex: 1, backgroundColor: bg }}>
          <View style={[styles.webviewHeader, { backgroundColor: cardBg, borderBottomColor: isDark ? "#404040" : "#E5E5E5" }]}>
            <TouchableOpacity
              onPress={() => {
                setShowPaystack(false);
                resetPaymentState();
                Alert.alert('Payment Cancelled', 'Your payment has been cancelled.');
              }}
              style={styles.closeWebviewButton}
            >
              <ArrowLeft size={24} color={text} />
            </TouchableOpacity>
            <Text style={[styles.webviewTitle, { color: text }]}>Complete Payment</Text>
            <View style={{ width: 24 }} />
          </View>

          {paymentUrl ? (
            <WebView
              ref={webviewRef}
              source={{ uri: paymentUrl }}
              style={{ flex: 1 }}
              onNavigationStateChange={handleNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={[styles.loadingContainer, { backgroundColor: bg }]}>
                  <ActivityIndicator size="large" color={accentColor} />
                  <Text style={[styles.loadingText, { color: text }]}>Loading payment page...</Text>
                </View>
              )}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              mixedContentMode="always"
            />
          ) : (
            <View style={[styles.loadingContainer, { backgroundColor: bg }]}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={[styles.loadingText, { color: text }]}>Initializing payment...</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Address Selection Modal */}
      <Modal visible={showAddressModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>Select Delivery Address</Text>
            {savedAddresses.map((address, index) => (
              <TouchableOpacity
                key={address.id || index}
                onPress={() => {
                  setSelectedAddress(address);
                  setShowAddressModal(false);
                }}
                style={[styles.addressOption, { borderBottomColor: isDark ? "#404040" : "#E5E5E5" }]}
              >
                <MapPin size={20} color={subtitleText} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={[styles.addressMain, { color: text }]}>{address.address}</Text>
                  <Text style={[styles.addressSub, { color: subtitleText }]}>
                    Coordinates: {address.latitude}, {address.longitude}
                  </Text>
                </View>
                {selectedAddress?.id === address.id && (
                  <Text style={[styles.selectedText, { color: accentColor }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowAddressModal(false)}
              style={[styles.closeButton, { backgroundColor: accentColor }]}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.container, { backgroundColor: bg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? "#404040" : "#E5E5E5" }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: text }]}>Checkout</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Order Items */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: text }]}>Your Order</Text>
            {localCart.map(item => (
              <View key={item.id} style={[styles.cartItem, { borderBottomColor: isDark ? "#404040" : "#E5E5E5" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cartItemName, { color: text }]}>{item.name}</Text>
                  <Text style={[styles.cartItemPrice, { color: subtitleText }]}>R {item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.qtyButton, { borderColor: accentColor, opacity: item.quantity > 1 ? 1 : 0.5 }]}
                    onPress={() => decreaseQuantity(item.id)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} color={accentColor} />
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: text }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyButton, { borderColor: accentColor }]}
                    onPress={() => increaseQuantity(item.id)}
                  >
                    <Plus size={16} color={accentColor} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Delivery Address */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: text }]}>Delivery Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)} style={styles.addressRow}>
              <MapPin size={20} color={subtitleText} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[styles.addressMain, { color: text }]}>
                  {selectedAddress ? selectedAddress.address : deliveryAddress || 'No address selected'}
                </Text>
                <Text style={[styles.addressSub, { color: subtitleText }]}>
                  Coordinates: {selectedAddress ? `${selectedAddress.latitude}, ${selectedAddress.longitude}` : `${deliveryLatitude}, ${deliveryLongitude}`}
                </Text>
              </View>
              <Text style={[styles.changeText, { color: accentColor }]}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: text }]}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: subtitleText }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: text }]}>R {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: subtitleText }]}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, { color: text }]}>R {deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopColor: isDark ? "#404040" : "#E5E5E5", borderTopWidth: 1, paddingTop: 8, marginTop: 8 }]}>
              <Text style={[styles.totalLabel, { color: text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: accentColor }]}>R {total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            onPress={placeOrder}
            disabled={loading}
            style={[styles.placeOrderButton, { backgroundColor: accentColor, opacity: loading ? 0.6 : 1 }]}
          >
            <CreditCard size={20} color="#FFFFFF" />
            <Text style={styles.placeOrderText}>{loading ? 'Processing...' : 'Place Order & Pay'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  cartItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  cartItemName: { fontSize: 16, fontWeight: "500" },
  cartItemPrice: { fontSize: 14, marginTop: 4 },
  quantityControls: { flexDirection: "row", alignItems: "center" },
  qtyButton: { borderWidth: 1, borderRadius: 6, padding: 4, marginHorizontal: 8 },
  quantityText: { fontSize: 16, fontWeight: "600" },
  addressRow: { flexDirection: "row", alignItems: "flex-start" },
  addressMain: { fontSize: 16, fontWeight: "500" },
  addressSub: { fontSize: 14, marginTop: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "600" },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold" },
  placeOrderButton: { flexDirection: "row", paddingVertical: 16, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 16 },
  placeOrderText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  successCard: { borderRadius: 16, padding: 32, alignItems: "center", width: "90%", maxWidth: 400 },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  successText: { fontSize: 16, textAlign: "center", marginBottom: 24 },
  homeButton: { paddingVertical: 16, borderRadius: 12, width: "100%", alignItems: "center" },
  homeButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  findDriverButton: { paddingVertical: 16, borderRadius: 12, width: "100%", alignItems: "center", marginBottom: 12 },
  findDriverButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  deliveryCodeTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  deliveryCode: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  qrContainer: { alignItems: "center", marginBottom: 16 },
  qrText: { fontSize: 14, marginBottom: 8 },
  webviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1 },
  webviewTitle: { fontSize: 18, fontWeight: "bold" },
  closeWebviewButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", maxHeight: "70%", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  addressOption: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  selectedText: { fontSize: 16, fontWeight: "bold" },
  closeButton: { marginTop: 20, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  closeButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  changeText: { fontSize: 14, fontWeight: "600" },
});