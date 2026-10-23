# Fix Profile Loading Twice Issue

## Tasks
- [ ] Update HomeScreen to use user data from AuthContext instead of separate API call
- [ ] Update ProfileScreen to use user data from AuthContext instead of separate API call
- [ ] Test that profile data loads correctly without duplicate API calls

## Completed Tasks
- [x] Update CheckoutScreen.tsx to add missing handler functions and conditional rendering
  - Added localCart state to manage cart updates
  - Added increaseQuantity and decreaseQuantity functions
  - Added onPress handlers to quantity control buttons
  - Added conditional rendering to disable minus button when quantity is 1
  - Updated subtotal calculation and placeOrder to use localCart
- [x] Integrate saved addresses fetching in CheckoutScreen
  - Added useEffect to fetch saved addresses on component mount
  - Added state for savedAddresses and selectedAddress
  - Added address selection modal with list of saved addresses
  - Updated delivery address display to show selected address or fallback
  - Modified placeOrder to use selectedAddress if available
- [x] Fix "User ID not found. Please log in again." error in CheckoutScreen
  - Changed destructuring from `const { user } = useAuth();` to `const { backendUser } = useAuth();`
  - Updated user ID check from `if (!user.id)` to `if (!backendUser.id)`
  - Updated order data to use `backendUser.id` for `user_id`
  - Updated PaystackWebView billing info to use `backendUser` properties
- [x] Fix duplicate WebView navigation logs in CheckoutScreen
  - Added lastNavigatedUrl state to track the last navigated URL
  - Added paymentProcessed flag to prevent duplicate payment processing
  - Modified handleNavigationStateChange to skip logging and processing if URL is the same or payment already processed
  - This prevents the repeated logs shown in the issue
