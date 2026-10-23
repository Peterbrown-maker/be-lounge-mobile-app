-- Database schema for Sosha Deliveries

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  phone VARCHAR(20),
  profile_image_url VARCHAR(500),
  role ENUM('customer', 'rider', 'admin') DEFAULT 'customer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Riders table
CREATE TABLE IF NOT EXISTS riders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vehicle_type ENUM('bike', 'car', 'truck') DEFAULT 'bike',
  license_number VARCHAR(50),
  vehicle_registration VARCHAR(50),
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  status ENUM('available', 'busy', 'offline') DEFAULT 'offline',
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_deliveries INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  images JSON,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(20),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  delivery_time VARCHAR(50) DEFAULT '30-45 mins',
  delivery_fee DECIMAL(5, 2) DEFAULT 0.00,
  category VARCHAR(100),
  emoji VARCHAR(10),
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(8, 2) NOT NULL,
  image TEXT,
  category VARCHAR(100) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  rider_id INT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled') DEFAULT 'pending',
  order_type ENUM('delivery', 'pickup') DEFAULT 'delivery',
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(5, 2) DEFAULT 0.00,
  tax_amount DECIMAL(5, 2) DEFAULT 0.00,
  delivery_address TEXT,
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  special_instructions TEXT,
  delivery_code VARCHAR(10) NULL,
  delivery_qr_code VARCHAR(500) NULL,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  payment_reference VARCHAR(255) NULL,
  estimated_delivery_time TIMESTAMP NULL,
  actual_delivery_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE SET NULL
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(8, 2) NOT NULL,
  total_price DECIMAL(8, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  sender_id INT NOT NULL,
  sender_type ENUM('user', 'rider', 'restaurant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Saved Addresses table
CREATE TABLE IF NOT EXISTS saved_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'promotion', 'system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NULL,
  rider_id INT NULL,
  order_id INT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('card', 'paypal', 'cash') DEFAULT 'card',
  provider VARCHAR(50),
  last_four VARCHAR(4),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
  discount_value DECIMAL(5, 2) NOT NULL,
  minimum_order DECIMAL(8, 2) DEFAULT 0.00,
  max_uses INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Promotions table
CREATE TABLE IF NOT EXISTS order_promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  promotion_id INT NOT NULL,
  discount_amount DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_riders_user_id ON riders(user_id);
CREATE INDEX idx_riders_status ON riders(status);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_rider_id ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_saved_addresses_user_id ON saved_addresses(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_rider_id ON reviews(rider_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_promotions_code ON promotions(code);
