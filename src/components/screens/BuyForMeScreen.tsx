import { GoogleGenAI } from "@google/genai";
import * as Location from "expo-location";
import { ArrowLeft, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Initialize Gemini
const genAI = new GoogleGenAI({
  apiKey: "AIzaSyDPDbnLagPohSu54I7o3K7mjzYabm99754", // Replace with your API key
});

interface Message {
  text: string;
  user: boolean;
  menuItems?: MenuItem[];
}

interface MenuItem {
  name: string;
  price: number;
  category?: string;
  includes?: string[];
  addOns?: AddOn[];
}

interface AddOn {
  name: string;
  price: number;
}

interface OrderItem extends MenuItem {
  quantity: number;
  selectedAddOns?: AddOn[];
}

interface BuyForMeScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

export const BuyForMeScreen = ({ onBack, onContinue }: BuyForMeScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("Detecting location...");
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        text: "Hi! 👋 I'm your AI shopping assistant. Tell me what you'd like to order (e.g., 'Big Mac Meal', 'Zinger Burger', 'Pizza'). I'll find the nearest restaurant and show you the menu!",
        user: false,
      },
    ]);
  }, []);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setUserLocation("Location access denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city and province
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const city = address.city || address.subregion || "Unknown";
        const province = address.region || "Unknown";
        setUserLocation(`${city}, ${province}`);
      } else {
        setUserLocation("Location not found");
      }
    } catch (error) {
      console.error("Location error:", error);
      setUserLocation("Location unavailable");
    }
  };

  // Ask Gemini API with structured prompt
  const askGemini = async (prompt: string) => {
    try {
      const res = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return res.text;
    } catch (err) {
      console.error("Gemini API Error:", err);
      return "Sorry, I couldn't process your request. Please try again.";
    }
  };

  // Parse menu items with includes and add-ons
  const parseMenuItems = (text: string): MenuItem[] => {
    const items: MenuItem[] = [];
    
    const lines = text.split('\n');
    let currentItem: MenuItem | null = null;

    for (const line of lines) {
      // Pattern for main item: "Item Name - R50" or "Item Name: R50"
      const itemMatch = /^([A-Za-z0-9\s\(\)]+?)\s*[-:]\s*R\s*(\d+(?:\.\d{2})?)/i.exec(line);
      
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2]);
        
        if (name.length > 2 && price > 0 && !items.some(item => item.name === name)) {
          currentItem = { name, price, includes: [], addOns: [] };
          items.push(currentItem);
        }
      } else if (currentItem && line.trim()) {
        // Check for "Includes:" or "Comes with:" details
        const includesMatch = /(?:includes?|comes with|contains):\s*(.+)/i.exec(line);
        if (includesMatch) {
          const includesText = includesMatch[1];
          const includedItems = includesText
            .split(/[,&]/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
          currentItem.includes = (currentItem.includes || []).concat(includedItems);
        }

        // Check for "Add-ons:" or "Can add:" details with prices
        const addOnsMatch = /(?:add-?ons?|can add|optional|extras?):\s*(.+)/i.exec(line);
        if (addOnsMatch) {
          const addOnsText = addOnsMatch[1];
          const addOnItems = addOnsText.split(/[,&]/).map(item => {
            const trimmed = item.trim();
            // Try to extract price like "+R5" or "R5"
            const priceMatch = /R\s*(\d+(?:\.\d{2})?)/i.exec(trimmed);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
            const name = trimmed.replace(/\s*\+?R\s*\d+(?:\.\d{2})?\s*$/i, "").trim();
            return { name, price };
          }).filter(addon => addon.name.length > 0);
          
          currentItem.addOns = (currentItem.addOns || []).concat(addOnItems);
        }
      }
    }

    return items;
  };

  // Send user message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, user: true }]);
    setLoading(true);
    setInput("");

    // Prompt to get menu with includes and add-ons
    const prompt = `You are a shopping assistant for a user in ${userLocation}, South Africa.

User wants: "${userMessage}"

TASK:
1. Find the NEAREST restaurant/shop in or around ${userLocation} that serves this item
2. Show popular menu items with prices and what comes with them
3. List add-ons/extras available for each item with prices

FORMAT - Use EXACTLY this format for each item:

Item Name - R[price]
Includes: [drink type, sides, what comes in the meal - be specific]
Add-ons: [addon name +R price], [addon name +R price], [addon name +R price]

EXAMPLES:
Big Mac Meal - R89.90
Includes: Big Mac burger, medium fries, medium drink (Coke/Sprite)
Add-ons: Extra cheese +R8, Bacon +R10, Upsize drink +R5, Upsize fries +R6

Zinger Burger - R67.50
Includes: Zinger burger, medium fries, regular drink
Add-ons: Cheese +R6, Extra mayo +R3, Upsize meal +R5

9 Piece Bucket - R129.99
Includes: 9 pieces chicken, 2 regular fries, 2 regular drinks
Add-ons: Extra sauce +R2, Coleslaw +R15, Beans +R12, Bread roll +R5

RULES:
- List 6-8 popular items
- Be specific about what's included (drink type, size, exact sides)
- Add realistic add-ons for each item
- Use realistic South African prices
- No extra text, just the menu`;

    try {
      const response = await askGemini(prompt);
      const menuItems = parseMenuItems(response);

      setMessages(prev => [
        ...prev,
        { text: response || "Sorry, I couldn't process your request.", user: false, menuItems: menuItems.length > 0 ? menuItems : undefined },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: "Sorry, I encountered an error. Please try again.", user: false },
      ]);
    }

    setLoading(false);
  };

  // Open item details modal
  const openItemDetails = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setSelectedAddOns([]);
    setModalVisible(true);
  };

  // Toggle add-on selection
  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.name === addOn.name);
      if (exists) {
        return prev.filter(a => a.name !== addOn.name);
      } else {
        return [...prev, addOn];
      }
    });
  };

  // Add item with selected add-ons to order
  const confirmAddItem = () => {
    if (!selectedMenuItem) return;

    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(i => i.name === selectedMenuItem.name);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { ...selectedMenuItem, quantity: 1, selectedAddOns }];
      }
    });

    // Add confirmation message
    const addOnsList = selectedAddOns.length > 0 
      ? `\n+ ${selectedAddOns.map(a => `${a.name} (+R${a.price.toFixed(2)})`).join(", ")}`
      : "";
    
    setMessages(prev => [
      ...prev,
      { text: `✅ Added ${selectedMenuItem.name} (R${selectedMenuItem.price.toFixed(2)})${addOnsList}`, user: true },
    ]);

    setModalVisible(false);
    setSelectedMenuItem(null);
    setSelectedAddOns([]);
  };

  // Remove item from order
  const removeItem = (index: number) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      if (updated[index].quantity > 1) {
        updated[index].quantity -= 1;
      } else {
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  // Calculate totals
  const totalPrice = selectedItems.reduce((sum, item) => {
    const addOnsPrice = item.selectedAddOns ? item.selectedAddOns.reduce((a, b) => a + b.price, 0) : 0;
    return sum + (item.price + addOnsPrice) * item.quantity;
  }, 0);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle payment
  const handlePayment = () => {
    const orderSummary = selectedItems
      .map(item => {
        const addOnsPrice = item.selectedAddOns ? item.selectedAddOns.reduce((a, b) => a + b.price, 0) : 0;
        const itemTotal = (item.price + addOnsPrice) * item.quantity;
        const addOnsText = item.selectedAddOns && item.selectedAddOns.length > 0
          ? ` (+ ${item.selectedAddOns.map(a => `${a.name} R${a.price.toFixed(2)}`).join(", ")})`
          : "";
        return `${item.quantity}x ${item.name}${addOnsText} - R${itemTotal.toFixed(2)}`;
      })
      .join('\n');
    
    setMessages(prev => [
      ...prev,
      { 
        text: `🛒 Order Summary:\n${orderSummary}\n\nTotal: R${totalPrice.toFixed(2)}\n\nProcessing payment...`, 
        user: false 
      },
    ]);
    
    // Clear order after "payment"
    setTimeout(() => {
      setSelectedItems([]);
      setMessages(prev => [
        ...prev,
        { text: "Thank you! Your order has been placed. 🎉", user: false },
      ]);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
  >
   
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>🛍️ AI Shopping Assistant</Text>
          <Text style={styles.locationText}>📍 {userLocation}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        style={styles.messageList}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View>
            <View style={[styles.message, item.user ? styles.userMsg : styles.aiMsg]}>
              <Text style={item.user ? styles.userText : styles.aiText}>
                {item.text}
              </Text>
            </View>

            {/* Menu buttons below AI messages */}
            {!item.user && item.menuItems && item.menuItems.length > 0 && (
              <View style={styles.menuButtonsContainer}>
                <Text style={styles.menuTitle}>Tap to customize & order:</Text>
                <View style={styles.menuGrid}>
                  {item.menuItems.map((menuItem, index) => (
                    <TouchableOpacity
                      key={`${menuItem.name}-${index}`}
                      style={styles.menuButton}
                      onPress={() => openItemDetails(menuItem)}
                    >
                      <Text style={styles.menuButtonText}>{menuItem.name}</Text>
                      <Text style={styles.menuButtonPrice}>R{menuItem.price.toFixed(2)}</Text>
                      {menuItem.includes && menuItem.includes.length > 0 && (
                        <Text style={styles.menuButtonDetails} numberOfLines={1}>
                          📦 {menuItem.includes[0]}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Item Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color="#111111" />
            </TouchableOpacity>

            {selectedMenuItem && (
              <ScrollView style={styles.modalScroll}>
                {/* Item Title and Price */}
                <Text style={styles.modalTitle}>{selectedMenuItem.name}</Text>
                <Text style={styles.modalPrice}>R{selectedMenuItem.price.toFixed(2)}</Text>

                {/* What's Included */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📦 Includes:</Text>
                  {selectedMenuItem.includes && selectedMenuItem.includes.length > 0 ? (
                    selectedMenuItem.includes.map((item, i) => (
                      <Text key={i} style={styles.includeItem}>
                        • {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.includeItem}>No specific items listed</Text>
                  )}
                </View>

                {/* Add-ons */}
                {selectedMenuItem.addOns && selectedMenuItem.addOns.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>➕ Available Add-ons:</Text>
                    <Text style={styles.addonSubtitle}>Select any to add:</Text>
                    {selectedMenuItem.addOns.map((addOn, i) => {
                      const isSelected = selectedAddOns.find(a => a.name === addOn.name);
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.addonOption,
                            isSelected && styles.addonOptionSelected,
                          ]}
                          onPress={() => toggleAddOn(addOn)}
                        >
                          <View style={styles.addonCheck}>
                            {isSelected && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                          <View style={styles.addonInfo}>
                            <Text style={styles.addonName}>{addOn.name}</Text>
                          </View>
                          <Text style={styles.addonPrice}>+R{addOn.price.toFixed(2)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Add-on Summary */}
                {selectedAddOns.length > 0 && (
                  <View style={styles.addOnsSummary}>
                    <Text style={styles.addOnsSummaryTitle}>Selected Add-ons:</Text>
                    {selectedAddOns.map((addon, i) => (
                      <Text key={i} style={styles.addOnsSummaryItem}>
                        • {addon.name} +R{addon.price.toFixed(2)}
                      </Text>
                    ))}
                    <Text style={styles.addOnsTotal}>
                      Add-ons Total: R{selectedAddOns.reduce((sum, a) => sum + a.price, 0).toFixed(2)}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={confirmAddItem}
              >
                <Text style={styles.addButtonText}>
                  Add to Order • R{(selectedMenuItem ? selectedMenuItem.price + (selectedAddOns.reduce((sum, a) => sum + a.price, 0)) : 0).toFixed(2)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Summary */}
      {selectedItems.length > 0 && (
        <View style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>🛒 Your Order ({totalItems} items)</Text>
            <TouchableOpacity onPress={() => setSelectedItems([])}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.orderItems}>
            {selectedItems.map((item, i) => {
              const addOnsPrice = item.selectedAddOns ? item.selectedAddOns.reduce((a, b) => a + b.price, 0) : 0;
              const itemTotal = (item.price + addOnsPrice) * item.quantity;
              return (
                <View key={i}>
                  <View style={styles.orderItem}>
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName}>
                        {item.quantity}x {item.name}
                      </Text>
                      <Text style={styles.orderItemPrice}>
                        R{itemTotal.toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeItem(i)}
                    >
                      <Text style={styles.removeButtonText}>−</Text>
                    </TouchableOpacity>
                  </View>
                  {item.includes && item.includes.length > 0 && (
                    <Text style={styles.itemDetails}>
                      📦 {item.includes.join(", ")}
                    </Text>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <Text style={styles.itemAddOns}>
                      ➕ {item.selectedAddOns.map(a => `${a.name} (+R${a.price.toFixed(2)})`).join(", ")}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>R{totalPrice.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <Text style={styles.payButtonText}>💳 Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="What would you like to order?"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    backgroundColor: "#000000",
    padding: 16,
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#E5E5E5",
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  message: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
  },
  userMsg: {
    backgroundColor: "#000000",
    alignSelf: "flex-end",
  },
  aiMsg: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  aiText: {
    color: "#111111",
    fontSize: 15,
    lineHeight: 22,
  },
  menuButtonsContainer: {
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 8,
  },
  menuTitle: {
    fontSize: 13,
    color: "#737373",
    marginBottom: 8,
    fontWeight: "600",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  menuButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    minWidth: 140,
  },
  menuButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 2,
  },
  menuButtonPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
    marginBottom: 4,
  },
  menuButtonDetails: {
    fontSize: 11,
    color: "#171717",
    fontWeight: "500",
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingTop: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  includeItem: {
    fontSize: 14,
    color: "#404040",
    marginVertical: 4,
  },
  addonSubtitle: {
    fontSize: 13,
    color: "#737373",
    marginBottom: 8,
    fontStyle: "italic",
  },
  addonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  addonOptionSelected: {
    backgroundColor: "#E5E5E5",
    borderColor: "#000000",
  },
  addonCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  addonInfo: {
    flex: 1,
  },
  addonName: {
    fontSize: 14,
    color: "#111111",
    fontWeight: "500",
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  addOnsSummary: {
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#000000",
  },
  addOnsSummaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  addOnsSummaryItem: {
    fontSize: 12,
    color: "#404040",
    marginVertical: 2,
  },
  addOnsTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#A3A3A3",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#404040",
  },
  addButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#000000",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  orderSummary: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    padding: 16,
    maxHeight: 300,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  clearButton: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  orderItems: {
    maxHeight: 150,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  orderItemInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 14,
    color: "#404040",
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },
  itemDetails: {
    fontSize: 12,
    color: "#737373",
    paddingHorizontal: 8,
    paddingBottom: 4,
    fontStyle: "italic",
  },
  itemAddOns: {
    fontSize: 12,
    color: "#262626",
    paddingHorizontal: 8,
    paddingBottom: 8,
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#F5F5F5",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#E5E5E5",
    marginBottom: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  payButton: {
    backgroundColor: "#000000",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 70,
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#A3A3A3",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});