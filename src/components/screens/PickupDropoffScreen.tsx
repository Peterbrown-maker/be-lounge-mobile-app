import * as Location from "expo-location";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

type LocationType = { lat: number; lng: number; address: string };

export const PickupDropoffScreen = ({ onBack, onContinue }: any) => {
  const [pickup, setPickup] = useState<LocationType | null>(null);
  const [dropoff, setDropoff] = useState<LocationType | null>(null);
  const [activeSelection, setActiveSelection] = useState<"pickup" | "dropoff" | null>(null);
  const [region, setRegion] = useState<any>(null);

  const mapRef = useRef<MapView>(null);

  // Request location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const setCurrentLocation = async (type: "pickup" | "dropoff") => {
    const loc = await Location.getCurrentPositionAsync({});
    const addresses = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    const address = addresses[0]?.name + ", " + addresses[0]?.city;
    if (type === "pickup") setPickup({ lat: loc.coords.latitude, lng: loc.coords.longitude, address });
    else setDropoff({ lat: loc.coords.latitude, lng: loc.coords.longitude, address });
    setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  const handleMapPress = async (e: any) => {
    if (!activeSelection) return; // only act if user selected pickup/dropoff mode
    const coords = e.nativeEvent.coordinate;
    const addresses = await Location.reverseGeocodeAsync({ latitude: coords.latitude, longitude: coords.longitude });
    const address = addresses[0]?.name + ", " + addresses[0]?.city;

    if (activeSelection === "pickup") setPickup({ lat: coords.latitude, lng: coords.longitude, address });
    else setDropoff({ lat: coords.latitude, lng: coords.longitude, address });
  };

  const isFormComplete = pickup && dropoff;

  return (
    <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed
    style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📦 Pick Up & Drop Off</Text>
      </View>

      {/* Map */}
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
        >
          {pickup && <Marker coordinate={{ latitude: Number(pickup.lat) || 0, longitude: Number(pickup.lng) || 0 }} title="Pickup" pinColor="blue" draggable onDragEnd={handleMapPress} />}
          {dropoff && <Marker coordinate={{ latitude: Number(dropoff.lat) || 0, longitude: Number(dropoff.lng) || 0 }} title="Dropoff" pinColor="green" draggable onDragEnd={handleMapPress} />}
        </MapView>
      )}

      {/* Controls */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 140 }}>
        <Text style={styles.label}>Pickup Location</Text>
        <TextInput value={pickup?.address || ""} placeholder="Select pickup on map or use current location" style={styles.input} />
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => setActiveSelection("pickup")} style={[styles.selectButton, activeSelection === "pickup" && styles.activeButton]}>
            <Text style={styles.buttonText}>Select on Map</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentLocation("pickup")} style={styles.selectButton}>
            <Text style={styles.buttonText}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Dropoff Location</Text>
        <TextInput value={dropoff?.address || ""} placeholder="Select dropoff on map or use current location" style={styles.input} />
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => setActiveSelection("dropoff")} style={[styles.selectButton, activeSelection === "dropoff" && styles.activeButton]}>
            <Text style={styles.buttonText}>Select on Map</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentLocation("dropoff")} style={styles.selectButton}>
            <Text style={styles.buttonText}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity disabled={!isFormComplete} style={[styles.continueButton, { backgroundColor: isFormComplete ? "#2563EB" : "#9CA3AF" }]} onPress={() => onContinue(pickup, dropoff)}>
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  map: { width: "100%", height: 250 },
  scrollContainer: { padding: 16, backgroundColor: "#F3F4F6" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#111827" },
  input: { backgroundColor: "#FFF", padding: 12, borderRadius: 12, fontSize: 16, marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  selectButton: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#E5E7EB", alignItems: "center", marginHorizontal: 4 },
  activeButton: { backgroundColor: "#2563EB" },
  buttonText: { color: "#111827", fontWeight: "600" },
  continueButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 16 },
  continueButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
