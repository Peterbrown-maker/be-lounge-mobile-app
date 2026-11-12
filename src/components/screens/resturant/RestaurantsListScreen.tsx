// ============================================
// RestaurantsListScreen.tsx (FIXED)
// ============================================

import { ArrowLeft, Clock, MapPin as MapPinIcon, Star } from "lucide-react-native";
import React, { useMemo } from "react";
import {
	Dimensions,
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface Restaurant {
	id: string;
	name: string;
	rating: number;
	deliveryTime: string;
	distance: string;
	category: string;
	emoji: string;
	image?: string;
	images: string[] | string;
	latitude: number;
	longitude: number;
}

interface RestaurantsListScreenProps {
	restaurant: Restaurant;
	onBack: () => void;
	onRestaurantSelect: (restaurant: Restaurant) => void;
}

export const RestaurantsListScreen = (props: RestaurantsListScreenProps) => {
	const { restaurant, onBack, onRestaurantSelect } = props;

	console.log("RestaurantsListScreen DEBUG:", {
		restaurantName: restaurant?.name,
		imagesType: typeof restaurant?.images,
		imagesIsArray: Array.isArray(restaurant?.images),
		imagesValue: restaurant?.images,
		imagesLength: Array.isArray(restaurant?.images) ? restaurant.images.length : 'N/A',
	});

	// Error checks
	if (!onRestaurantSelect) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
				<Text style={{ fontSize: 18, color: "#000000", textAlign: "center" }}>
					Error: onRestaurantSelect prop is missing
				</Text>
			</View>
		);
	}

	if (!restaurant) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
				<Text style={{ fontSize: 18, color: "#000000", textAlign: "center" }}>
					Error: restaurant prop is missing
				</Text>
			</View>
		);
	}

	const isDark = false; // MacNose uses a fixed light theme
	const bg = isDark ? "#000000" : "#FFFFFF";
	const text = isDark ? "#FFFFFF" : "#111111";
	const cardBg = isDark ? "#262626" : "#FAFAFA";
	const subtitleText = isDark ? "#A3A3A3" : "#737373";
	const accentColor = isDark ? "#000000" : "#000000";
	const screenWidth = Dimensions.get("window").width;

	// Parse and validate images - handle both string and array formats
	const parsedImages = useMemo(() => {
		try {
			if (!restaurant.images) {
				// Fallback to single image if available
				return restaurant.image ? [restaurant.image] : [];
			}

			// If it's already an array of strings, use it
			if (Array.isArray(restaurant.images)) {
				const validImages = restaurant.images.filter(img => 
					img && typeof img === 'string' && img.length > 0
				);
				console.log("RestaurantsListScreen: Parsed array images:", validImages.length);
				return validImages.length > 0 ? validImages : (restaurant.image ? [restaurant.image] : []);
			}

			// If it's a JSON string, parse it
			if (typeof restaurant.images === 'string') {
				if (restaurant.images.startsWith('[')) {
					try {
						const parsed = JSON.parse(restaurant.images);
						if (Array.isArray(parsed)) {
							const validImages = parsed.filter(img => 
								img && typeof img === 'string' && img.length > 0
							);
							console.log("RestaurantsListScreen: Parsed JSON images:", validImages.length);
							return validImages.length > 0 ? validImages : (restaurant.image ? [restaurant.image] : []);
						}
					} catch (e) {
						console.warn("RestaurantsListScreen: Failed to parse JSON images:", e);
					}
				}
				// If it's a single image string, treat it as one image
				if (restaurant.images.length > 0) {
					console.log("RestaurantsListScreen: Using single image string");
					return [restaurant.images];
				}
			}

			return restaurant.image ? [restaurant.image] : [];
		} catch (error) {
			console.error("RestaurantsListScreen: Error parsing images:", error);
			return restaurant.image ? [restaurant.image] : [];
		}
	}, [restaurant.images, restaurant.image]);

	const handleMenuPress = () => {
		console.log("View Menu button pressed for:", restaurant.name);
		if (onRestaurantSelect && typeof onRestaurantSelect === "function") {
			onRestaurantSelect(restaurant);
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: bg }]}>
			<View style={[styles.header, { borderBottomColor: isDark ? "#404040" : "#E5E5E5" }]}>
				<TouchableOpacity onPress={onBack} style={styles.backButton}>
					<ArrowLeft size={24} color={text} />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: text }]}>{restaurant.name}</Text>
			</View>

			<ScrollView style={styles.content}>
				{/* IMAGE CAROUSEL */}
				{parsedImages && parsedImages.length > 0 ? (
					<FlatList
						data={parsedImages}
						keyExtractor={(_, index) => `image-${index}`}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						scrollEventThrottle={16}
						removeClippedSubviews={false}
						style={{ marginBottom: 16 }}
						renderItem={({ item }) => (
							<View style={{ width: screenWidth }}>
								<Image
									source={{ uri: item }}
									style={{ width: "100%", height: 250, backgroundColor: cardBg }}
									resizeMode="cover"
									onError={(error) => {
										console.warn(`Image failed to load: ${item}`, error.nativeEvent.error);
									}}
									onLoadStart={() => {
										console.log("Image loading:", item.substring(0, 50));
									}}
									onLoad={() => {
										console.log("Image loaded successfully");
									}}
								/>
							</View>
						)}
					/>
				) : (
					<View style={{ height: 250, backgroundColor: cardBg, justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
						<Text style={{ color: subtitleText, marginBottom: 8 }}>📷 No images available</Text>
						{restaurant.image && (
							<Text style={{ color: subtitleText, fontSize: 12 }}>
								(No parsed images, but single image exists)
							</Text>
						)}
					</View>
				)}

				<View style={styles.detailContent}>
					<Text style={[styles.restaurantName, { color: text }]}>
						{restaurant.emoji} {restaurant.name}
					</Text>

					<View style={styles.infoRow}>
						<Star size={16} color={accentColor} />
						<Text style={[styles.infoText, { color: subtitleText }]}>
							{restaurant.rating || "N/A"}
						</Text>

						<Clock size={16} color={subtitleText} style={{ marginLeft: 12 }} />
						<Text style={[styles.infoText, { color: subtitleText }]}>
							{restaurant.deliveryTime || "N/A"}
						</Text>

						<MapPinIcon size={16} color={subtitleText} style={{ marginLeft: 12 }} />
						<Text style={[styles.infoText, { color: subtitleText }]}>
							{restaurant.distance || "N/A"}
						</Text>
					</View>

					{/* MAP */}
					{restaurant.latitude !== 0 && restaurant.longitude !== 0 ? (
						<View style={styles.mapContainer}>
							<MapView
								style={StyleSheet.absoluteFill}
								initialRegion={{
									latitude: Number(restaurant.latitude),
									longitude: Number(restaurant.longitude),
									latitudeDelta: 0.01,
									longitudeDelta: 0.01,
								}}
							>
								<Marker
									coordinate={{
										latitude: Number(restaurant.latitude),
										longitude: Number(restaurant.longitude),
									}}
									title={restaurant.name}
								/>
							</MapView>
						</View>
					) : (
						<View style={[styles.mapContainer, { backgroundColor: cardBg, justifyContent: "center", alignItems: "center" }]}>
							<Text style={{ color: subtitleText }}>📍 Map Preview</Text>
						</View>
					)}

					<TouchableOpacity
						style={[styles.viewMenuButton, { backgroundColor: accentColor }]}
						onPress={handleMenuPress}
					>
						<Text style={styles.viewMenuButtonText}>View Menu / Order</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
	backButton: { marginRight: 16 },
	headerTitle: { fontSize: 20, fontWeight: "bold" },
	content: { flex: 1 },
	restaurantName: { fontSize: 24, fontWeight: "600", marginBottom: 4 },
	infoRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
	infoText: { fontSize: 14, marginLeft: 4 },
	detailContent: { padding: 16 },
	mapContainer: { height: 200, borderRadius: 16, overflow: "hidden", marginTop: 16 },
	viewMenuButton: { marginTop: 24, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
	viewMenuButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});