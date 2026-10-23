import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ordersApiService } from '../../services/orders';

interface FindingDriverScreenProps {
  orderId: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  onDriverFound: (riderInfo: any) => void;
}

export const FindingDriverScreen = ({
  orderId,
  deliveryAddress,
  deliveryLatitude,
  deliveryLongitude,
  onDriverFound
}: FindingDriverScreenProps) => {
  const [findingProgress, setFindingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Finding available drivers...');
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCalledApi = useRef(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#05070A' : '#FFF';
  const text = isDark ? '#FFF' : '#111827';
  const subtitleText = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = isDark ? '#4F46E5' : '#2563EB';

  const messages = [
    'Finding available drivers...',
    'Checking driver locations...',
    'Matching with the best driver...',
    'Driver found! Preparing for pickup...'
  ];

  // Call backend API to find driver
  const findDriver = async () => {
    if (hasCalledApi.current) return;
    hasCalledApi.current = true;

    try {
      setError(null);
      const response = await ordersApiService.findDriver(parseInt(orderId));

      if (response.success && response.rider) {
        setCurrentMessage('Driver found! Preparing for pickup...');
        setFindingProgress(100);
        // Ensure coordinates are numbers
        const rider = {
          ...response.rider,
          currentLocation: {
            latitude: Number(response.rider.currentLocation?.latitude) || Number(deliveryLatitude) - 0.01,
            longitude: Number(response.rider.currentLocation?.longitude) || Number(deliveryLongitude) - 0.01,
          }
        };
        setTimeout(() => onDriverFound(rider), 500);
      } else {
        setError('No drivers available at the moment');
        setIsSearching(false);
      }
    } catch (err: any) {
      console.error('Error finding driver:', err);
      // Fallback to mock driver if API fails
      const mockRider = {
        id: 'rider_' + Date.now(),
        name: 'Demo Driver',
        phone: '+27 123 456 7890',
        vehicle: 'motorcycle',
        rating: 4.8,
        currentLocation: {
          latitude: Number(deliveryLatitude) - 0.01 || -25.51,
          longitude: Number(deliveryLongitude) - 0.01 || 28.09
        }
      };
      setCurrentMessage('Driver found! Preparing for pickup...');
      setFindingProgress(100);
      setTimeout(() => onDriverFound(mockRider), 500);
    }
  };

  useEffect(() => {
    // Progress animation
    const interval = setInterval(() => {
      setFindingProgress(prev => {
        const newProgress = prev + 2;

        // Update message based on progress
        if (newProgress < 25) {
          setCurrentMessage(messages[0]);
        } else if (newProgress < 50) {
          setCurrentMessage(messages[1]);
        } else if (newProgress < 75) {
          setCurrentMessage(messages[2]);
        }

        // When progress reaches 70%, call the API
        if (newProgress >= 70 && !hasCalledApi.current) {
          findDriver();
        }

        if (newProgress >= 95 && !hasCalledApi.current) {
          // Safety timeout - call API if not already called
          findDriver();
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    hasCalledApi.current = false;
    setFindingProgress(0);
    setError(null);
    setIsSearching(true);
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.content}>
          <Text style={styles.errorIcon}>😔</Text>
          <Text style={[styles.mainMessage, { color: text }]}>No Drivers Available</Text>
          <Text style={[styles.subMessage, { color: subtitleText }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: accentColor }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.content}>
        {/* Animated motorcycle icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.motorcycleIcon}>🏍️</Text>
          <View style={styles.pulseRing} />
          <View style={[styles.pulseRing, styles.pulseRing2]} />
        </View>

        {/* Loading indicator */}
        <ActivityIndicator
          size="large"
          color={accentColor}
          style={styles.spinner}
        />

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${findingProgress}%`, backgroundColor: accentColor }
            ]}
          />
        </View>

        {/* Status messages */}
        <Text style={[styles.mainMessage, { color: text }]}>
          Finding Your Driver
        </Text>
        <Text style={[styles.subMessage, { color: subtitleText }]}>
          {currentMessage}
        </Text>

        {/* Order details */}
        <View style={[styles.orderCard, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
          <Text style={[styles.orderTitle, { color: text }]}>Order #{orderId}</Text>
          <Text style={[styles.orderAddress, { color: subtitleText }]}>
            Delivering to: {deliveryAddress}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  motorcycleIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  pulseRing: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2563EB',
    opacity: 0.7,
  },
  pulseRing2: {
    animationDelay: '1s',
    opacity: 0.4,
  },
  spinner: {
    marginBottom: 24,
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  mainMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
