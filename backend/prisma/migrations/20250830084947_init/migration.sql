-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "address_th" TEXT NOT NULL,
    "address_en" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "business_hours" TEXT,
    "cuisine_type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "phone" TEXT,
    "restaurant_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurant_id" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_th" TEXT,
    "description_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuCategory_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurant_id" TEXT NOT NULL,
    "category_id" TEXT,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_th" TEXT,
    "description_en" TEXT,
    "price_thb" REAL NOT NULL,
    "cost_thb" REAL,
    "spice_level" INTEGER,
    "preparation_time" INTEGER,
    "is_vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "is_vegan" BOOLEAN NOT NULL DEFAULT false,
    "is_halal" BOOLEAN NOT NULL DEFAULT false,
    "is_gluten_free" BOOLEAN NOT NULL DEFAULT false,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "allergens" TEXT NOT NULL,
    "nutritional_info" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Menu_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Menu_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "MenuCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurant_id" TEXT NOT NULL,
    "table_number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "location_x" INTEGER,
    "location_y" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Table_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "table_id" TEXT,
    "user_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "subtotal_thb" REAL NOT NULL,
    "tax_thb" REAL NOT NULL DEFAULT 0,
    "service_charge_thb" REAL NOT NULL DEFAULT 0,
    "total_thb" REAL NOT NULL,
    "payment_method" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Order_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_thb" REAL NOT NULL,
    "total_price_thb" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_tax_id_key" ON "Restaurant"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_number_key" ON "Order"("order_number");
