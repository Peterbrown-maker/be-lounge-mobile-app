import { ArrowRight, MessageCircle, Phone } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface Rider {
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

interface DriverFoundScreenProps {
  rider: Rider;
  orderId: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  onContinueToTracking: () => void;
}

export const DriverFoundScreen = ({
  rider,
  orderId,
  deliveryAddress,
  deliveryLatitude,
  deliveryLongitude,
  onContinueToTracking
}: DriverFoundScreenProps) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#05070A' : '#FFF';
  const text = isDark ? '#FFF' : '#111827';
  const cardBg = isDark ? '#1F2937' : '#F9FAFB';
  const subtitleText = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = isDark ? '#4F46E5' : '#2563EB';

  const { width, height } = Dimensions.get('window');

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Map showing rider location */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: Number(rider.currentLocation.latitude) || -25.5,
          longitude: Number(rider.currentLocation.longitude) || 28.1,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Rider motorcycle marker */}
        <Marker
          coordinate={{
            latitude: Number(rider.currentLocation.latitude) || -25.5,
            longitude: Number(rider.currentLocation.longitude) || 28.1,
          }}
          title={`${rider.name} - ${rider.vehicle}`}
          description={`Rating: ${rider.rating} ⭐`}
        >
          <View style={styles.motorcycleMarker}>
            <Text style={styles.motorcycleEmoji}>🏍️</Text>
          </View>
        </Marker>

        {/* Delivery destination marker */}
        <Marker
          coordinate={{
            latitude: Number(deliveryLatitude) || -25.5,
            longitude: Number(deliveryLongitude) || 28.1,
          }}
          title="Delivery Address"
          description={deliveryAddress}
          pinColor="red"
        />
      </MapView>

      {/* Driver info card */}
      <View style={[styles.driverCard, { backgroundColor: cardBg }]}>
        <View style={styles.driverHeader}>
          <Text style={[styles.driverFoundText, { color: accentColor }]}>
            Driver Found! 🎉
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {rider.rating}</Text>
          </View>
        </View>

        <View style={styles.driverInfo}>
          <Text style={[styles.driverName, { color: text }]}>
            {rider.name}
          </Text>
          <Text style={[styles.vehicleInfo, { color: subtitleText }]}>
            White Motorcycle • {rider.vehicle}
          </Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={[styles.orderLabel, { color: subtitleText }]}>
            Order #{orderId}
          </Text>
          <Text style={[styles.deliveryAddress, { color: text }]}>
            📍 {deliveryAddress}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.contactButton, { borderColor: accentColor }]}>
            <Phone size={20} color={accentColor} />
            <Text style={[styles.contactButtonText, { color: accentColor }]}>
              Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactButton, { borderColor: accentColor }]}>
            <MessageCircle size={20} color={accentColor} />
            <Text style={[styles.contactButtonText, { color: accentColor }]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: accentColor }]}
          onPress={onContinueToTracking}
        >
          <Text style={styles.continueButtonText}>Continue to Tracking</Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  motorcycleMarker: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  motorcycleEmoji: {
    fontSize: 24,
  },
  driverCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverFoundText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingContainer: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  driverInfo: {
    marginBottom: 16,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 16,
  },
  orderInfo: {
    marginBottom: 20,
  },
  orderLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 16,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
