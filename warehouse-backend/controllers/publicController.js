const warehouseModel = require("../models/warehouseModel");
const messageModel = require("../models/messageModel");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "nexus-fallback-secret-key";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicController = {
    async getPublicWarehouses(req, res) {
        try {
            const { city, min_area, max_rate, min_rate, category, search, page, limit, type } = req.query;
            const result = await warehouseModel.getPublic({ 
                city, 
                min_area, 
                max_rate, 
                min_rate,
                category, 
                search,
                type,
                page: parseInt(page) || 1, 
                limit: parseInt(limit) || 12 
            });
            res.json({ success: true, ...result });
        } catch (err) {
            console.error("[PUBLIC CONTROLLER] getPublicWarehouses failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to fetch warehouses. Please try again." });
        }
    },

    async getPublicFeaturedWarehouses(req, res) {
        try {
            const warehouses = await warehouseModel.getFeatured();
            res.json({ success: true, data: warehouses });
        } catch (err) {
            console.error("[PUBLIC CONTROLLER] getPublicFeaturedWarehouses failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to fetch featured warehouses. Please try again." });
        }
    },

    async getPublicWarehouseById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            const warehouse = await warehouseModel.getById(id);
            if (!warehouse) {
                return res.status(404).json({ success: false, error: "Warehouse not found" });
            }
            res.json({ success: true, data: warehouse });
        } catch (err) {
            console.error("[PUBLIC CONTROLLER] getPublicWarehouseById failed:", err.message);
            if (err.message === "INVALID_ID") {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            res.status(500).json({ success: false, error: "Failed to fetch warehouse. Please try again." });
        }
    },

    async submitNewWarehouse(req, res) {
        try {
            const data = req.body;
            console.log("[PUBLIC DEBUG] submitNewWarehouse payload received:", data);

            if (!data.city || !data.city.trim()) {
                return res.status(400).json({ success: false, error: "City is required", field: "city" });
            }
            if (!data.contact_phone) {
                return res.status(400).json({ success: false, error: "Contact phone is required", field: "contact_phone" });
            }

            let userId = null;
            if (req.headers.authorization) {
                try {
                    const decoded = jwt.verify(req.headers.authorization, JWT_SECRET);
                    userId = decoded.id;
                } catch (err) {
                    console.warn("[PUBLIC CONTROLLER] Optional token invalid — submitting as guest:", err.message);
                }
            }

            const warehouse = await warehouseModel.create(data, userId);
            res.status(201).json({ success: true, data: warehouse });
        } catch (err) {
            console.error("[PUBLIC CONTROLLER] submitNewWarehouse failed:", err.message);
            if (err.message === "CITY_REQUIRED") {
                return res.status(400).json({ success: false, error: "City is required", field: "city" });
            }
            if (err.message === "CONTACT_PHONE_REQUIRED") {
                return res.status(400).json({ success: false, error: "Contact phone is required", field: "contact_phone" });
            }
            res.status(500).json({ success: false, error: "Submission failed. Please try again." });
        }
    },

    async submitContactMessage(req, res) {
        try {
            const { name, email, message } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({ success: false, error: "Name is required", field: "name" });
            }
            if (!email || !emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: "Valid email is required", field: "email" });
            }
            if (!message || !message.trim()) {
                return res.status(400).json({ success: false, error: "Message is required", field: "message" });
            }

            const result = await messageModel.create(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (err) {
            console.error("[PUBLIC CONTROLLER] submitContactMessage failed:", err.message);
            if (err.message === "NAME_REQUIRED") {
                return res.status(400).json({ success: false, error: "Name is required", field: "name" });
            }
            if (err.message === "EMAIL_REQUIRED") {
                return res.status(400).json({ success: false, error: "Valid email is required", field: "email" });
            }
            if (err.message === "MESSAGE_REQUIRED") {
                return res.status(400).json({ success: false, error: "Message is required", field: "message" });
            }
            res.status(500).json({ success: false, error: "Failed to send message. Please try again." });
        }
    },

    async getAvailableCities(req, res) {
        try {
            const result = await pool.query("SELECT DISTINCT city FROM warehouses WHERE status IN ('Available', 'Land Parcel') ORDER BY city ASC");
            const cities = result.rows.map(row => row.city);
            res.json({ success: true, data: cities });
        } catch (err) {
            console.error("[PUBLIC CONTROLLER] getAvailableCities failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to fetch cities." });
        }
    }
};

module.exports = publicController;