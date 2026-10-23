-- Migration: Add delivery_code, delivery_qr_code, payment_status, and payment_reference columns to orders table
-- Run this migration on existing databases to add the new columns

-- Add delivery_code column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'delivery_code' AND TABLE_SCHEMA = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN delivery_code VARCHAR(10) NULL AFTER special_instructions', 'SELECT "Column delivery_code already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add delivery_qr_code column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'delivery_qr_code' AND TABLE_SCHEMA = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN delivery_qr_code VARCHAR(500) NULL AFTER delivery_code', 'SELECT "Column delivery_qr_code already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_status column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_status' AND TABLE_SCHEMA = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN payment_status ENUM("pending", "completed", "failed") DEFAULT "pending" AFTER delivery_qr_code', 'SELECT "Column payment_status already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_reference column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_reference' AND TABLE_SCHEMA = DATABASE());
SET @sql = IF(@col_exists = 0, 'ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255) NULL AFTER payment_status', 'SELECT "Column payment_reference already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Simple version (run these if the above doesn't work):
-- ALTER TABLE orders ADD COLUMN delivery_code VARCHAR(10) NULL;
-- ALTER TABLE orders ADD COLUMN delivery_qr_code VARCHAR(500) NULL;
-- ALTER TABLE orders ADD COLUMN payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending';
-- ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255) NULL;

SELECT 'Migration completed successfully' as status;
