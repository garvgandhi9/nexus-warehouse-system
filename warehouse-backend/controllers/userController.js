const warehouseModel = require("../models/warehouseModel");

const userController = {
    async getUserWarehouses(req, res) {
        try {
            const warehouses = await warehouseModel.getByUserId(req.userId);
            res.json({ success: true, data: warehouses });
        } catch (err) {
            console.error("[USER CONTROLLER] getUserWarehouses failed:", err.message);
            if (err.message === "INVALID_USER_ID") {
                return res.status(401).json({ success: false, error: "Unauthorized — please log in again" });
            }
            res.status(500).json({ success: false, error: "Failed to fetch your warehouses. Please try again." });
        }
    },

    async updateUserWarehouse(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }

            const data = req.body;
            if (!data.city || !data.city.trim()) {
                return res.status(400).json({ success: false, error: "City is required", field: "city" });
            }

            const warehouse = await warehouseModel.update(id, req.userId, data);
            if (!warehouse) {
                return res.status(404).json({ success: false, error: "Warehouse not found or you don't have permission to edit it" });
            }

            res.json({ success: true, data: warehouse });
        } catch (err) {
            console.error("[USER CONTROLLER] updateUserWarehouse failed:", err.message);
            if (err.message === "INVALID_ID") {
                return res.status(400).json({ success: false, error: "Invalid warehouse ID" });
            }
            if (err.message === "INVALID_USER_ID") {
                return res.status(401).json({ success: false, error: "Unauthorized — please log in again" });
            }
            if (err.message === "WAREHOUSE_NOT_FOUND") {
                return res.status(404).json({ success: false, error: "Warehouse not found or you don't have permission to edit it" });
            }
            res.status(500).json({ success: false, error: "Update failed. Please try again." });
        }
    }
};

module.exports = userController;