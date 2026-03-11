-- Nexus Warehouse System - Database Schema

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_code VARCHAR(50) UNIQUE,
    city VARCHAR(100) NOT NULL,
    capacity_value VARCHAR(50),
    capacity_type VARCHAR(20) DEFAULT 'sqft',
    area_available NUMERIC,
    rate NUMERIC,
    min_lease VARCHAR(100),
    deposit VARCHAR(100),
    docks INTEGER DEFAULT 0,
    ceiling_height NUMERIC,
    nearest_port VARCHAR(255),
    nearest_airport VARCHAR(255),
    listing_mode VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    lease_type VARCHAR(50),
    source_name VARCHAR(255),
    source_contact VARCHAR(50),
    source_email VARCHAR(255),
    source_designation VARCHAR(100),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    full_address TEXT,
    category VARCHAR(100),
    description TEXT,
    image_url TEXT,
    industries TEXT[], -- Array of industries
    facilities TEXT[], -- Array of facilities
    amenities TEXT[],  -- Array of amenities
    temperature_range VARCHAR(100),
    product_suitability TEXT[],
    is_prime BOOLEAN DEFAULT FALSE,
    term_type VARCHAR(50) DEFAULT 'long_term',
    term_duration VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    source VARCHAR(100),
    context VARCHAR(255),
    category VARCHAR(100),
    tier VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Initial Admin User (Optional)
-- INSERT INTO users (name, email, password, is_admin) VALUES ('Admin', 'admin@nexus.com', 'hashed_password_here', true);
