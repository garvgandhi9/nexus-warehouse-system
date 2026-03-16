const warehouseModel = require("../models/warehouseModel");
const userModel = require("../models/userModel");
const messageModel = require("../models/messageModel");

const adminController = {
    async getWarehouses(req, res) {
        try {
            const warehouses = await warehouseModel.getAll();
            res.json({ success: true, data: warehouses });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] getWarehouses failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to fetch warehouses. Please try again." });
        }
    },

    async getUsers(req, res) {
        try {
            const users = await userModel.getAll();
            res.json({ success: true, data: users });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] getUsers failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to fetch users. Please try again." });
        }
    },

    async getMessages(req, res) {
        try {
            const messages = await messageModel.getAll();
            res.json({ success: true, data: messages });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] getMessages failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to fetch messages. Please try again." });
        }
    },

    async updateWarehouse(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            const data = req.body;
            const updated = await warehouseModel.adminUpdate(id, data);
            if (!updated) {
                return res.status(404).json({ success: false, error: "Warehouse not found" });
            }
            res.json({ success: true, data: updated, message: `Warehouse ${id} updated successfully` });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] updateWarehouse failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to update warehouse. Please try again." });
        }
    },

    async createWarehouse(req, res) {
        try {
            const data = req.body;
            const created = await warehouseModel.adminCreate(data);
            res.json({ success: true, data: created, message: "Warehouse created successfully" });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] createWarehouse failed:", err.message);
            res.status(500).json({ success: false, error: "Failed to create warehouse. Please try again." });
        }
    },

    async approveWarehouse(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            const warehouse = await warehouseModel.approve(id);
            res.json({ success: true, data: warehouse, message: `Warehouse ${id} approved successfully` });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] approveWarehouse failed:", err.message);
            if (err.message === "INVALID_ID") {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            if (err.message === "WAREHOUSE_NOT_FOUND") {
                return res.status(404).json({ success: false, error: "Warehouse not found" });
            }
            res.status(500).json({ success: false, error: "Approval failed. Please try again." });
        }
    },

    async deleteWarehouse(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            await warehouseModel.delete(id);
            res.json({ success: true, message: `Warehouse ${id} deleted successfully` });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] deleteWarehouse failed:", err.message);
            if (err.message === "INVALID_ID") {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            if (err.message === "WAREHOUSE_NOT_FOUND") {
                return res.status(404).json({ success: false, error: "Warehouse not found" });
            }
            res.status(500).json({ success: false, error: "Delete failed. Please try again." });
        }
    },

    async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, error: "Invalid message ID" });
            }
            await messageModel.delete(id);
            res.json({ success: true, message: `Message ${id} deleted successfully` });
        } catch (err) {
            console.error("[ADMIN CONTROLLER] deleteMessage failed:", err.message);
            if (err.message === "INVALID_ID") {
                return res.status(400).json({ success: false, error: "Invalid message ID" });
            }
            if (err.message === "MESSAGE_NOT_FOUND") {
                return res.status(404).json({ success: false, error: "Message not found" });
            }
            res.status(500).json({ success: false, error: "Delete failed. Please try again." });
        }
    }
};

module.exports = adminController;