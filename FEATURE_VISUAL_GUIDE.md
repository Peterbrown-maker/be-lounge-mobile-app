# Feature Flow Diagrams & Visual Guide

## 🎯 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOME SCREEN                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Welcome back, [User Name]                                │   │
│  │ [user@email.com]                                         │   │
│  │ 🔔 Profile                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         ⭐ SPECIAL OFFERS CAROUSEL (NEW)                │   │
│  │                                                           │   │
│  │  ╔════════════════════════════════════════════════════╗ │   │
│  │  ║  🎸 Sunday Feast                                   ║ │   │
│  │  ║  Live Band • 30% OFF                               ║ │   │
│  │  ║  Family meals with entertainment                   ║ │   │
│  │  ║  ► Explore Deal                                    ║ │   │
│  │  ╚════════════════════════════════════════════════════╝ │   │
│  │                   [◄] ● ○ ○ ○ ○ [►]                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MENU CATEGORIES                             │   │
│  │  [🍗][🍖][🥗][🍽️][🥪][🌯]                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Select Item → Add to Cart → [🛒 Cart Items]               │   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              CHECKOUT SCREEN (NEW)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 👤 Your Details                                          │   │
│  │ Email: user@email.com                                   │   │
│  │ Name: User Name                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🎯 Booking Type                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   🚗        │  │   🏠        │  │   🎁        │    │   │
│  │  │  Delivery   │  │  Sit-in     │  │  Take-away  │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  IF SIT-IN SELECTED:                                        │   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ⏰ Time: [11:00][12:00][13:00]...[20:00]              │   │
│  │ 👥 Guests: [2][3][4][5]...[10+]                       │   │
│  │ 📍 Location: [Inside] [Patio] [Private]               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📝 Special Requests                                     │   │
│  │ [Allergies, preferences...]                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📋 Order Summary                                        │   │
│  │ Classic Chicken Prego x2      R170                      │   │
│  │ Chicken Wings x1               R120                      │   │
│  │                           ─────────                      │   │
│  │ TOTAL:                         R290                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│                  [Proceed to Payment]                          │   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              PAYMENT SCREEN (NEW)                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 💰 Order Summary                                        │   │
│  │ Subtotal:           R260                                │   │
│  │ Delivery Fee:       R30                                 │   │
│  │ ─────────────────────────                               │   │
│  │ TOTAL:              R290                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 💳 Payment Method                                       │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐    │   │
│  │  │ ⚡ Paystack         │  │ 💳 Card Payment      │    │   │
│  │  │ Fast & Secure       │  │ Visa, Mastercard     │    │   │
│  │  │ (SELECTED)          │  │                      │    │   │
│  │  └──────────────────────┘  └──────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│              [Pay R290.00]                                    │   │
│              (Processing...)                                 │   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                     (2 second processing)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              PAYMENT SUCCESS                                     │
│                                                                   │
│                       ✅                                         │
│                  (Pulsing animation)                             │
│                                                                   │
│            Payment Successful!                                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Payment ID: PAY-1729712024                              │   │
│  │ Amount: R290.00                                         │   │
│  │ Type: Delivery                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│         Initializing your order...                             │
│              (Auto-proceeding in 2.5s)                       │   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│         DRIVER TRACKING SCREEN (NEW)                             │
│                                                                   │
│  ╔═════════════════════════════════════════════════════════╗   │
│  ║        STAGE 1: Finding Driver (3 seconds)              ║   │
│  ║                                                          ║   │
│  ║            ◯ ◯ ◯ (Pulsing rings)                        ║   │
│  ║               🚗                                         ║   │
│  ║                                                          ║   │
│  ║         Finding Driver...                               ║   │
│  ║   Looking for available drivers near you                ║   │
│  ║                                                          ║   │
│  ║            ⚙️ (Loading spinner)                          ║   │
│  ╚═════════════════════════════════════════════════════════╝   │
│                            ↓ (3s pass)
│  ╔═════════════════════════════════════════════════════════╗   │
│  ║        STAGE 2: Driver Found!                            ║   │
│  ║  ┌──────────────────────────────────────────────┐       ║   │
│  ║  │ 👨‍💼 Sipho Mthembu                            │       ║   │
│  ║  │ ⭐ 4.9 (250 trips)                           │       ║   │
│  ║  │ 🚗 Toyota Avanza - GP69 YTE                  │       ║   │
│  ║  │ 📍 ETA: 12 minutes                [☎️ Call] │       ║   │
│  ║  └──────────────────────────────────────────────┘       ║   │
│  ║                                                          ║   │
│  ║  📋 Order Status Timeline                               ║   │
│  ║  ✓ Order Confirmed          Just now                    ║   │
│  ║  ✓ Preparing Your Order     2 mins                      ║   │
│  ║  ✓ Order Ready              8 mins                      ║   │
│  ║  ✓ Driver Assigned          12 mins                     ║   │
│  ║  ◯ On the Way               15 mins                     ║   │
│  ║  ◯ Arriving Soon            18 mins                     ║   │
│  ║                                                          ║   │
│  ║              [Cancel Order]                             ║   │
│  ╚═════════════════════════════════════════════════════════╝   │
│                            ↓ (4s on way)
│  ╔═════════════════════════════════════════════════════════╗   │
│  ║        STAGE 3: Driver on the Way                        ║   │
│  ║  ┌──────────────────────────────────────────────┐       ║   │
│  ║  │      📍 Real-time Map View                   │       ║   │
│  ║  │                                              │       ║   │
│  ║  │     🚗 (rotating)                            │       ║   │
│  ║  │                                              │       ║   │
│  ║  │             📍                               │       ║   │
│  ║  │           Your location                      │       ║   │
│  ║  └──────────────────────────────────────────────┘       ║   │
│  ║                                                          ║   │
│  ║  ETA: 8 minutes                                         ║   │
│  ╚═════════════════════════════════════════════════════════╝   │
│                            ↓ (8s tracking)
│  ╔═════════════════════════════════════════════════════════╗   │
│  ║        STAGE 4: Driver Arrived!                          ║   │
│  ║                                                          ║   │
│  ║           🎉 Order Code                                 ║   │
│  ║                                                          ║   │
│  ║            FH9XKZPL5M                                   ║   │
│  ║                                                          ║   │
│  ║     Show this code when collecting your order            ║   │
│  ║                                                          ║   │
│  ║  📋 Order Status                                        ║   │
│  ║  ✓ Order Confirmed                                     ║   │
│  ║  ✓ Preparing Your Order                                ║   │
│  ║  ✓ Order Ready                                         ║   │
│  ║  ✓ Driver Assigned                                     ║   │
│  ║  ✓ On the Way                                          ║   │
│  ║  ✓ Arriving Soon                                       ║   │
│  ╚═════════════════════════════════════════════════════════╝   │
│                            ↓ (auto)
│  ╔═════════════════════════════════════════════════════════╗   │
│  ║        STAGE 5: Order Complete!                          ║   │
│  ║                                                          ║   │
│  ║                    ✅                                    ║   │
│  ║            (Pulsing checkmark)                           ║   │
│  ║                                                          ║   │
│  ║           Thank you for your order!                      ║   │
│  ║                                                          ║   │
│  ║  ┌──────────────────────────────────────────────┐       ║   │
│  ║  │ Order Code:     FH9XKZPL5M                   │       ║   │
│  ║  │ Total Amount:   R290.00                      │       ║   │
│  ║  │ Order Type:     Delivery                     │       ║   │
│  ║  └──────────────────────────────────────────────┘       ║   │
│  ║                                                          ║   │
│  ║                [Back to Home]                           ║   │
│  ╚═════════════════════════════════════════════════════════╝   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                      Back to HomeScreen
```

---

## 📊 Special Offers Carousel

```
┌──────────────────────────────────────────────────────────────┐
│  Special Offers                Limited time deals             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  ╔═══════════════════════════════════════════════════╗ │ │
│  │  ║             SUNDAY FEAST                          ║ │ │
│  │  ║  ┌─────────────────────────────────────────────┐ ║ │ │
│  │  ║  │         🎵                                  │ ║ │ │
│  │  ║  │      UP TO 30% OFF                          │ ║ │ │
│  │  ║  └─────────────────────────────────────────────┘ ║ │ │
│  │  ║                                                   ║ │ │
│  │  ║  Live Music & Entertainment                      ║ │ │
│  │  ║  Experience live band performances while         ║ │ │
│  │  ║  enjoying family meals                           ║ │ │
│  │  ║                                                   ║ │ │
│  │  ║  Valid: Every Sunday                            ║ │ │
│  │  ║                                                   ║ │ │
│  │  ║  ✓ Live band performances                        ║ │ │
│  │  ║  ✓ Family-style platters                        ║ │ │
│  │  ║                                                   ║ │ │
│  │  ║            [Explore Deal]                        ║ │ │
│  │  ╚═══════════════════════════════════════════════════╝ │ │
│  │                                                         │ │
│  │  [◄] ● ○ ○ ○ ○ [►]                                   │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  Tap any offer to learn more or book now                    │
└──────────────────────────────────────────────────────────────┘

Scroll Left ◄ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─► Scroll Right

Cards (in order):
1. 🎸 Sunday Feast (Red gradient)       - Live band, 30% off
2. 🌾 Market Day Special (Orange)       - Fresh produce, 20% off
3. 🎯 Monday Night Out (Green)          - Quiz & Bingo games
4. ☕ Weekend Brunch (Blue)             - Brunch combos
5. 🍹 Happy Hour Special (Purple)       - 50% off drinks
```

---

## 📱 Screen Layout Dimensions

### All Screens:
- **Header Height**: 64px (with gradient)
- **Section Padding**: 16px horizontal, 16px vertical
- **Card Border Radius**: 12px
- **Button Height**: 48px (touch-friendly)

### Checkout Screen:
- **Total Height**: Full screen with scroll
- **Section Gaps**: 16px
- **Input Fields**: 44px minimum height

### Payment Screen:
- **Card Height**: 140px
- **Method Cards**: 72px each with 10px gap

### Driver Tracking:
- **Driver Card**: 120px
- **Timeline Item**: 60px per status
- **Map Area**: 200px height (simulated)

### Special Offers Carousel:
- **Card Width**: Full width - 32px (16px each side)
- **Card Height**: 360px
- **Gesture Area**: Full width for horizontal scroll

---

## 🎨 Color Reference

```
Flavor Brand Colors:
├─ Primary Accent: #F59E0B (Warm Orange)
├─ Secondary: #FB923C (Light Orange)  
├─ Success: #10B981 (Green)
├─ Error: #EF4444 (Red)
└─ Neutral: #6B7280 (Gray)

Special Offers Gradient Colors:
├─ Sunday Feast: #DC2626 → #991B1B (Red)
├─ Market Day: #EA580C → #C2410C (Orange)
├─ Monday Night: #2E7D32 → #1B5E20 (Green)
├─ Weekend Brunch: #1E40AF → #1E3A8A (Blue)
└─ Happy Hour: #7C3AED → #5B21B6 (Purple)

Dark Mode:
├─ Background: #1a1a1a
├─ Card Background: #222222
├─ Text Primary: #ffffff
└─ Text Secondary: #aaaaaa
```

---

## ⚡ Animation Timings

| Animation | Duration | Effect |
|-----------|----------|--------|
| Finding Driver Pulse | 1000ms | Scale 1x → 1.3x |
| Driver Found Transition | 3000ms | Auto → Tracking |
| Driver Tracking Animation | 4000ms | Continuous rotation |
| Order Code Display | 4000ms | Fade in & hold |
| Order Complete Pulse | 800ms | Scale 1x → 1.2x |
| Payment Success Animation | 2500ms | Checkmark pulse |
| Carousel Card Scale | Smooth | 0.9x → 1x on focus |
| Dot Indicator Transition | 300ms | Expand/contract |

---

## 🔄 Data Flow

```
User Details:
  Firebase Auth (user.email, user.displayName)
    ↓
  HomeScreen Header Display
    ↓
  Checkout Screen (pre-filled)
    ↓
  Payment Screen (display)
    ↓
  Driver Tracking (confirmation)

Booking Data:
  Checkout Selection
    ├─ bookingType (delivery/sitin/takeaway)
    ├─ deliveryAddress (if delivery)
    ├─ sitInTime (if sitin)
    ├─ partySize (if sitin)
    ├─ location (if sitin)
    └─ specialRequests
    ↓
  Payment Screen
    ├─ Added: paymentMethod, paymentId
    └─ Status: pending → completed
    ↓
  Driver Tracking
    ├─ Added: driverInfo, orderCode
    └─ Flow: finding → found → tracking → arrived → complete

Order Status Timeline:
  OrderConfirmed (0ms)
    ↓
  Preparing (2min)
    ↓
  Ready (8min)
    ↓
  DriverAssigned (12min)
    ↓
  OnTheWay (15min)
    ↓
  ArrivingSoon (18min)
    ↓
  Complete (auto nav)
```

---

## 📋 Testing Scenarios

### Scenario 1: Delivery Order
1. Select items
2. Choose "Delivery" booking type
3. Enter address
4. Review order
5. Proceed to Paystack payment
6. Wait for driver tracking simulation
7. Verify order code display
8. Confirm completion

### Scenario 2: Sit-in Order
1. Select items
2. Choose "Sit-in" booking type
3. Select time (e.g., 19:00)
4. Select party size (e.g., 4)
5. Select location (e.g., Patio)
6. Add special requests
7. Proceed to payment
8. Complete driver tracking (no physical delivery)
9. Show order code for in-person pickup

### Scenario 3: Special Offers
1. View home screen
2. Scroll special offers carousel
3. Tap "Explore Deal" on any offer
4. View offer details modal
5. Close and return to carousel

---

This document provides comprehensive visual and structural reference for all new features implemented in the Flavor Hospitality app.
