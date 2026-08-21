-- ==============================================================================
-- PostgreSQL Complete Database Dump & Schema Definition
-- Project: Chef's Kitchen / Mess Website CMS
-- Database Compatibility: PostgreSQL 14+, Supabase, Neon, AWS RDS, Local Postgres
-- Total Tables Covered: 10 of 10 (100% Schema & Data Completeness)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DROP EXISTING TABLES & CONSTRAINTS (Clean Re-creation)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS "_OrderToFoodMenu" CASCADE;
DROP TABLE IF EXISTS "_FoodItemToFoodMenu" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Option" CASCADE;
DROP TABLE IF EXISTS "FoodItem" CASCADE;
DROP TABLE IF EXISTS "FoodMenu" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "Setting" CASCADE;
DROP TABLE IF EXISTS "Admin" CASCADE;

-- ------------------------------------------------------------------------------
-- 2. CREATE SCHEMA TABLES
-- ------------------------------------------------------------------------------

-- Table 1: Admin
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- Table 2: Setting
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- Table 3: Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Table 4: FoodItem
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "monthlyPrice" DOUBLE PRECISION,
    "image" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- Table 5: Option
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- Table 6: FoodMenu
CREATE TABLE "FoodMenu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "availableDays" TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodMenu_pkey" PRIMARY KEY ("id")
);

-- Table 7: Customer
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "whatsappNo" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Table 8: Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "buildingName" TEXT,
    "flatRoomNumber" TEXT,
    "deliveryLocation" TEXT NOT NULL,
    "brunchLunchLocation" TEXT,
    "dinnerLocation" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentRemarks" TEXT,
    "paymentReceiptUrl" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderRemarks" TEXT,
    "selectionsJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeDates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "includeSundays" BOOLEAN NOT NULL DEFAULT true,
    "sundaysCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- Table 9: _FoodItemToFoodMenu (Many-to-Many junction between FoodItem and FoodMenu)
CREATE TABLE "_FoodItemToFoodMenu" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Table 10: _OrderToFoodMenu (Many-to-Many junction between Order and FoodMenu)
CREATE TABLE "_OrderToFoodMenu" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. UNIQUE INDEXES & PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

CREATE UNIQUE INDEX "_FoodItemToFoodMenu_AB_unique" ON "_FoodItemToFoodMenu"("A", "B");
CREATE INDEX "_FoodItemToFoodMenu_B_index" ON "_FoodItemToFoodMenu"("B");

CREATE UNIQUE INDEX "_OrderToFoodMenu_AB_unique" ON "_OrderToFoodMenu"("A", "B");
CREATE INDEX "_OrderToFoodMenu_B_index" ON "_OrderToFoodMenu"("B");

-- ------------------------------------------------------------------------------
-- 4. FOREIGN KEY CONSTRAINTS (CASCADE ON DELETE/UPDATE)
-- ------------------------------------------------------------------------------
ALTER TABLE "FoodItem" 
    ADD CONSTRAINT "FoodItem_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Option" 
    ADD CONSTRAINT "Option_foodItemId_fkey" 
    FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order" 
    ADD CONSTRAINT "Order_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_FoodItemToFoodMenu" 
    ADD CONSTRAINT "_FoodItemToFoodMenu_A_fkey" 
    FOREIGN KEY ("A") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_FoodItemToFoodMenu" 
    ADD CONSTRAINT "_FoodItemToFoodMenu_B_fkey" 
    FOREIGN KEY ("B") REFERENCES "FoodMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_OrderToFoodMenu" 
    ADD CONSTRAINT "_OrderToFoodMenu_A_fkey" 
    FOREIGN KEY ("A") REFERENCES "FoodMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_OrderToFoodMenu" 
    ADD CONSTRAINT "_OrderToFoodMenu_B_fkey" 
    FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ------------------------------------------------------------------------------
-- 5. COMPREHENSIVE SEED DATA FOR ALL TABLES
-- ------------------------------------------------------------------------------

-- Seed Table 1: Admin User (Password: admin123)
INSERT INTO "Admin" ("id", "email", "password") VALUES
('adm_seed_001', 'admin@chefs-kitchen.com', '$2a$10$wN1QY0M9uOaHk57aFw97I.eKqFv9W5sM3m8ZpXqj7tK6.0/sWJ11m')
ON CONFLICT ("email") DO UPDATE SET "password" = EXCLUDED."password";

-- Seed Table 2: Settings
INSERT INTO "Setting" ("id", "key", "value") VALUES
('set_001', 'restaurant_name', 'Chef''s Kitchen'),
('set_002', 'currency', 'AED'),
('set_003', 'contact_email', 'contact@chefs-kitchen.com'),
('set_004', 'contact_phone', '+971 50 123 4567'),
('set_005', 'delivery_charge', '0.00'),
('set_006', 'tax_rate', '5'),
('set_007', 'delivery_timing_lunch', '12:00 PM - 02:00 PM'),
('set_008', 'delivery_timing_dinner', '07:30 PM - 09:30 PM')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";

-- Seed Table 3: Categories
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt") VALUES
('cat_001', 'BREAK FAST', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_002', 'MOTA SET', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_003', 'BARIC SET', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_004', 'CHAPPATHI', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_005', 'BIRYANI', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_006', 'GHEE RICE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_007', 'FRIED RICE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_008', 'DINNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_009', 'SUNDAY SPECIAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Seed Table 4: Food Items
INSERT INTO "FoodItem" ("id", "name", "description", "price", "monthlyPrice", "image", "categoryId", "createdAt", "updatedAt") VALUES
-- Breakfast items
('item_001', 'BREAKFAST - APPAM WITH CURRY', 'Freshly prepared soft appam served with choice of curry', 8.0, 200.0, NULL, 'cat_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_002', 'BREAKFAST - POROTTA WITH GRAVY', 'Layered flaky porotta served with delicious spicy gravy', 8.0, 200.0, NULL, 'cat_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_003', 'BREAKFAST - DOSA & CHUTNEY', 'Crispy traditional dosa with sambar and fresh coconut chutney', 7.0, 175.0, NULL, 'cat_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_004', 'BREAKFAST - IDLI SAMBAR', 'Steamed soft idlis served with vegetable sambar & chutneys', 7.0, 175.0, NULL, 'cat_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Mota Rice Sets
('item_005', 'MOTA SET - FISH', 'Traditional Kerala Mota rice lunch with fried fish & gravies', 12.0, 300.0, NULL, 'cat_002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_006', 'MOTA SET - CHICKEN', 'Kerala Mota rice lunch set with flavorful chicken curry', 13.0, 325.0, NULL, 'cat_002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_007', 'MOTA SET - VEG', 'Vegetarian Mota rice meal with sambar, thoran, avial & rasam', 10.0, 250.0, NULL, 'cat_002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Baric / White Rice Sets
('item_008', 'BARIC SET - FISH', 'Fine white rice lunch meal served with fish curry & sides', 12.0, 300.0, NULL, 'cat_003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_009', 'BARIC SET - CHICKEN', 'Fine white rice lunch meal served with chicken curry', 13.0, 325.0, NULL, 'cat_003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_010', 'BARIC SET - VEG', 'Pure vegetarian fine white rice meal with side curries', 10.0, 250.0, NULL, 'cat_003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Chappathi Sets
('item_011', 'CHAPPATHI - FISH', 'Fresh soft chappathis served with authentic fish curry', 11.0, 275.0, NULL, 'cat_004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_012', 'CHAPPATHI - CHICKEN', 'Fresh soft chappathis served with tender chicken masala', 12.0, 300.0, NULL, 'cat_004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_013', 'CHAPPATHI - VEG', 'Fresh soft chappathis served with veg korma / curry', 10.0, 250.0, NULL, 'cat_004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Biryani & Specials
('item_014', 'BIRYANI - CHICKEN', 'Aromatic Dum Biryani with spiced chicken & boiled egg', 15.0, 375.0, NULL, 'cat_005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_015', 'BIRYANI - BEEF', 'Authentic Malabar style beef biryani with raita & pickle', 16.0, 400.0, NULL, 'cat_005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_016', 'BIRYANI - FISH', 'Rich flavored fish dum biryani made with fresh catch', 17.0, 425.0, NULL, 'cat_005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_017', 'BIRYANI - VEG', 'Flavor-packed fragrant vegetable dum biryani', 12.0, 300.0, NULL, 'cat_005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_018', 'GHEE RICE - CHICKEN', 'Flavored ghee rice served with spicy roast chicken', 14.0, 350.0, NULL, 'cat_006', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_019', 'GHEE RICE - BEEF', 'Fragrant ghee rice served with slow-cooked beef roast', 15.0, 375.0, NULL, 'cat_006', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_020', 'FRIED RICE', 'Wok-tossed Indo-Chinese style fried rice with vegetables', 12.0, 300.0, NULL, 'cat_007', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Dinner & Sunday Specials
('item_021', 'DINNER - POROTTA & BEEF FRY', 'Kerala porotta with special Malabar beef roast fry', 14.0, 350.0, NULL, 'cat_008', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_022', 'DINNER - CHAPPATHI & CHICKEN ROAST', 'Wheat chappathis with homestyle chicken roast gravy', 12.0, 300.0, NULL, 'cat_008', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('item_023', 'SUNDAY SPECIAL FEAST', 'Chef special full meal package with biryani & dessert', 20.0, 0.0, NULL, 'cat_009', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Seed Table 5: Options / Add-ons
INSERT INTO "Option" ("id", "name", "price", "foodItemId", "createdAt", "updatedAt") VALUES
('opt_001', 'Extra Fish Fry', 5.0, 'item_005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_002', 'Extra Chicken Roast', 6.0, 'item_006', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_003', 'Extra Boiled Egg', 2.0, 'item_014', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_004', 'Extra Porotta (2 pcs)', 3.0, 'item_021', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('opt_005', 'Extra Chappathi (2 pcs)', 2.5, 'item_022', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Seed Table 6: Food Menus / Meal Plans
INSERT INTO "FoodMenu" ("id", "name", "description", "price", "availableDays", "createdAt", "updatedAt") VALUES
('menu_001', 'Breakfast Plan', 'Daily rotating breakfast selections from Mon to Sat', 180.0, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('menu_002', 'LUNCH SPECIAL', 'Standard monthly lunch bundle with sets, biryanis & rice options', 250.0, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('menu_003', 'Dinner Plan', 'Evening dinner meals delivered directly to your room/flat', 220.0, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('menu_004', 'Full Day Combo (Brunch + Dinner)', 'All-inclusive monthly meal plan for lunch & dinner', 450.0, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Seed Table 7: Customers
INSERT INTO "Customer" ("id", "name", "phone", "email", "whatsappNo", "password", "createdAt", "updatedAt") VALUES
('cust_001', 'Suresh Developer', '93618-80749', 'sureshdeveloperofficial@gmail.com', '9361880749', '$2a$10$wN1QY0M9uOaHk57aFw97I.eKqFv9W5sM3m8ZpXqj7tK6.0/sWJ11m', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cust_002', 'RedFork Official', '+97197474328234724', 'redforkofficial@gmail.com', '+97197474328234724', '$2a$10$wN1QY0M9uOaHk57aFw97I.eKqFv9W5sM3m8ZpXqj7tK6.0/sWJ11m', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("phone") DO UPDATE SET "name" = EXCLUDED."name";

-- Seed Table 8: Orders
INSERT INTO "Order" (
    "id", 
    "customerId", 
    "address", 
    "buildingName", 
    "flatRoomNumber", 
    "deliveryLocation", 
    "brunchLunchLocation", 
    "dinnerLocation", 
    "paymentMethod", 
    "paymentStatus", 
    "paymentRemarks", 
    "paymentReceiptUrl", 
    "totalAmount", 
    "status", 
    "orderRemarks", 
    "selectionsJson", 
    "startDate", 
    "activeDates", 
    "includeSundays", 
    "sundaysCount", 
    "createdAt", 
    "updatedAt"
) VALUES
(
    'ord_seed_001',
    'cust_001',
    'Al Nahda 2, Dubai, UAE',
    'Al Hilal Building',
    'Flat 304',
    'Al Nahda, Dubai',
    'Office - Business Bay',
    'Room - Al Nahda 2',
    'COD',
    'PAID',
    'Paid via cash on delivery',
    NULL,
    250.0,
    'CONFIRMED',
    'Please ring the doorbell before leaving',
    '{"plan": "LUNCH SPECIAL", "monday": "MOTA SET - FISH", "tuesday": "BIRYANI - CHICKEN", "wednesday": "MOTA SET - CHICKEN", "thursday": "GHEE RICE - BEEF", "friday": "BIRYANI - CHICKEN", "saturday": "MOTA SET - VEG"}'::jsonb,
    CURRENT_TIMESTAMP,
    ARRAY['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07']::TEXT[],
    true,
    4,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'ord_seed_002',
    'cust_002',
    'Deira, Dubai, UAE',
    'Golden Sands Tower',
    'Flat 102',
    'Deira, Dubai',
    'Deira Shop #4',
    'Deira Flat 102',
    'ONLINE',
    'CONFIRMED',
    'Online Bank Transfer',
    NULL,
    450.0,
    'DELIVERED',
    'Combo plan active',
    '{"plan": "Full Day Combo", "lunch": "BARIC SET - FISH", "dinner": "DINNER - POROTTA & BEEF FRY"}'::jsonb,
    CURRENT_TIMESTAMP,
    ARRAY['2026-03-01', '2026-03-02', '2026-03-03']::TEXT[],
    false,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- Seed Table 9: _FoodItemToFoodMenu Relations (Mapping items to menus)
INSERT INTO "_FoodItemToFoodMenu" ("A", "B") VALUES
('item_001', 'menu_001'),
('item_002', 'menu_001'),
('item_003', 'menu_001'),
('item_004', 'menu_001'),
('item_005', 'menu_002'),
('item_006', 'menu_002'),
('item_007', 'menu_002'),
('item_008', 'menu_002'),
('item_009', 'menu_002'),
('item_010', 'menu_002'),
('item_011', 'menu_002'),
('item_012', 'menu_002'),
('item_013', 'menu_002'),
('item_014', 'menu_002'),
('item_015', 'menu_002'),
('item_016', 'menu_002'),
('item_017', 'menu_002'),
('item_018', 'menu_002'),
('item_019', 'menu_002'),
('item_020', 'menu_002'),
('item_021', 'menu_003'),
('item_022', 'menu_003'),
('item_023', 'menu_004')
ON CONFLICT DO NOTHING;

-- Seed Table 10: _OrderToFoodMenu Relations (Mapping orders to menus)
INSERT INTO "_OrderToFoodMenu" ("A", "B") VALUES
('menu_002', 'ord_seed_001'),
('menu_004', 'ord_seed_002')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- END OF DATABASE DUMP (100% TABLES & DATA COMPLETE)
-- ==============================================================================
