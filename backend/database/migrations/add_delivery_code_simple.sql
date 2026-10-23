-- Run this SQL to add missing delivery_code columns to your orders table

ALTER TABLE orders ADD COLUMN delivery_code VARCHAR(10) NULL AFTER special_instructions;
ALTER TABLE orders ADD COLUMN delivery_qr_code VARCHAR(500) NULL AFTER delivery_code;

-- Verify the columns were added
DESCRIBE orders;
