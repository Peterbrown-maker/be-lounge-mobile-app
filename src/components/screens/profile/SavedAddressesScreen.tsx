import usersApiService from "@/src/services/users";
import * as Location from "expo-location";
import { ArrowLeft, MapPin, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";


interface SavedAddressesScreenProps {
  onBack: () => void;
}

interface Address {
  id: number;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export const SavedAddressesScreen = ({ onBack }: SavedAddressesScreenProps) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const placesRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);
  const [placesKey, setPlacesKey] = useState(0);


  const [formData, setFormData] = useState({
    label: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const bg = isDark ? "#05070A" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111827";
  const subtitleText = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#1F2937" : "#F9FAFB";
  const inputBg = isDark ? "#0F172A" : "#F3F4F6";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const accentColor = isDark ? "#4F46E5" : "#2563EB";

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const userAddresses = await usersApiService.getUserAddresses();
      setAddresses(userAddresses);
    } catch (error: any) {
      console.error("Error loading addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await usersApiService.deleteUserAddress(id);
              setAddresses(addresses.filter(addr => addr.id !== id));
              Alert.alert("Success", "Address deleted successfully");
            } catch (error: any) {
              console.error("Error deleting address:", error);
              Alert.alert("Error", error.message || "Failed to delete address");
            }
          }
        },
      ]
    );
  };

 const handleAddAddress = async () => {
  // 1️⃣ SHOW FORM IMMEDIATELY (NO LAG)
  setShowAddForm(true);
setLocating(true);



  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please enable location permissions in settings"
      );
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // ⚡ faster than High
    });

    const { latitude, longitude } = location.coords;

    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }));

    // 2️⃣ BACKGROUND ADDRESS UPDATE
    reverseGeocode(latitude, longitude);
    setLocating(false);
  } catch (err) {
    console.error("Location error:", err);
  }
};



  const handleCancelAdd = () => {
    setShowAddForm(false);
    setFormData({ label: "", address: "", latitude: "", longitude: "" });
  };

  // Reverse geocode coordinates to address
 const reverseGeocode = async (latitude: number, longitude: number) => {
   try {
     const response = await fetch(
       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDLdDsZ3ofwAZXbJvLrolHhFOMxQiGnc6w`
      );
      const data = await response.json();

    if (data.results?.length) {
      const address = data.results[0].formatted_address;


      // 🔥 Update state
      setFormData(prev => ({
        ...prev,
        address,
      }));

      // 🔥 Force GooglePlacesAutocomplete to show this address
      setPlacesKey(prev => prev + 1); // force rerender
      setTimeout(() => {
        placesRef.current?.setAddressText(address); // then set input
      }, 50); // slight delay ensures it works
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }
};



  const handleSaveAddress = async () => {
    if (!formData.label.trim() || !formData.address.trim() || !formData.latitude.trim() || !formData.longitude.trim()) {
      Alert.alert("Validation Error", "All fields are required");
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert("Validation Error", "Invalid latitude or longitude");
      return;
    }

    setSaving(true);
    try {
      await usersApiService.addUserAddress({
        address: formData.address.trim(),
        latitude: lat,
        longitude: lng,
        label: formData.label.trim(),
      });

      Alert.alert("Success", "Address added successfully", [
        {
          text: "OK",
          onPress: () => {
            handleCancelAdd();
            loadAddresses(); // Reload addresses
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error adding address:", error);
      Alert.alert("Error", error.message || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed 
    style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "#374151" : "#E5E7EB" }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Saved Addresses</Text>
        <TouchableOpacity onPress={handleAddAddress} style={styles.addButton}>
          <Plus size={24} color={accentColor} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.content, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : showAddForm ? (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.addForm}>
            <Text style={[styles.formTitle, { color: text }]}>Add New Address</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: text }]}>Label *</Text>
              <TextInput
                value={formData.label}
                onChangeText={(text) => setFormData({ ...formData, label: text })}
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: text }]}
                placeholder="e.g. Home, Work"
                placeholderTextColor={subtitleText}
              />
            </View>

            <View style={styles.inputGroup}>
  <Text style={[styles.label, { color: text }]}>Address *</Text>

  <GooglePlacesAutocomplete
    key={placesKey} // to reset input if needed
    ref={placesRef}
    placeholder="Search for address"
    fetchDetails
    enablePoweredByContainer={false}
    debounce={300}
    minLength={2}
    onPress={(data, details) => {
  if (!details) return;

  const lat = details.geometry.location.lat;
  const lng = details.geometry.location.lng;
  const address = details.formatted_address;

  setFormData(prev => ({
    ...prev,
    address,
    latitude: lat.toString(),
    longitude: lng.toString(),
  }));

  // 🔥 KEEP INPUT SYNCED
  placesRef.current?.setAddressText(address);
}}

    query={{
      key: "AIzaSyDLdDsZ3ofwAZXbJvLrolHhFOMxQiGnc6w",
      language: "en",
      components: "country:za",
      types: "address",
    }}
    styles={{
      textInput: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: inputBg,
        color: text,
        borderWidth: 1,
        borderColor,
      },
      listView: {
        backgroundColor: cardBg,
        borderRadius: 12,
        marginTop: 8,
      },
      row: {
        padding: 14,
      },
      description: {
        color: text,
      },
    }}
  />
</View>
{locating && (
  <Text style={{ color: subtitleText, marginTop: 8 }}>
    Detecting current location…
  </Text>
)}


            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: text }]}>Location *</Text>
              <Text style={[styles.helperText, { color: subtitleText }]}>
                Drag the marker to set your exact location
              </Text>
              <View style={[styles.mapContainer, { borderColor }]}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={{
                    latitude: parseFloat(formData.latitude) || -26.2041,
                    longitude: parseFloat(formData.longitude) || 28.0473,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onRegionChangeComplete={(region: any) => {
                    setFormData({
                      ...formData,
                      latitude: region.latitude.toString(),
                      longitude: region.longitude.toString(),
                    });
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(formData.latitude) || -26.2041,
                      longitude: parseFloat(formData.longitude) || 28.0473,
                    }}
                    draggable
                   onDragEnd={(e) => {
  const { latitude, longitude } = e.nativeEvent.coordinate;

  setFormData(prev => ({
    ...prev,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  }));

  setTimeout(() => reverseGeocode(latitude, longitude), 300);
}}

                  />
                </MapView>
              </View>
              <Text style={[styles.coordsText, { color: subtitleText }]}>
                Lat: {parseFloat(formData.latitude).toFixed(6)}, Lng: {parseFloat(formData.longitude).toFixed(6)}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleCancelAdd}
                style={[styles.cancelButton, { borderColor }]}
                disabled={saving}
              >
                <Text style={[styles.cancelButtonText, { color: text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveAddress}
                style={[styles.saveButton, { backgroundColor: accentColor }]}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={48} color={subtitleText} />
              <Text style={[styles.emptyTitle, { color: text }]}>No saved addresses</Text>
              <Text style={[styles.emptySubtitle, { color: subtitleText }]}>Add your frequently used addresses for quick delivery</Text>
            </View>
          ) : (
            <View style={styles.addressesList}>
              {addresses.map((address) => (
                <View key={address.id} style={[styles.addressCard, { backgroundColor: cardBg }]}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressType}>
                      <MapPin size={20} color={accentColor} />
                      <Text style={[styles.typeText, { color: text }]}>{address.label}</Text>
                      {address.is_default && (
                        <View style={[styles.defaultBadge, { backgroundColor: accentColor }]}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteAddress(address.id)}>
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.addressText, { color: subtitleText }]}>{address.address}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  addButton: { padding: 8 },
  content: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  addForm: { gap: 16 },
  formTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  helperText: { fontSize: 12, marginTop: 4 },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  map: { flex: 1 },
  coordsText: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  cancelButton: { flex: 1, paddingVertical: 16, borderWidth: 1, borderRadius: 12, alignItems: "center", marginRight: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: "600" },
  saveButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginLeft: 8 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  addressesList: { gap: 16 },
  addressCard: { padding: 16, borderRadius: 12 },
  addressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  addressType: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeText: { fontSize: 16, fontWeight: "600" },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  defaultText: { color: "#FFFFFF", fontSize: 12, fontWeight: "500" },
  addressText: { fontSize: 14, lineHeight: 20 },
});
