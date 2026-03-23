const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const { upload } = require("../middleware/upload");

router.get("/warehouses/featured", publicController.getPublicFeaturedWarehouses);
router.get("/cities", publicController.getAvailableCities);
router.get("/warehouses", publicController.getPublicWarehouses);
router.get("/warehouses/:id", publicController.getPublicWarehouseById);
router.post("/submit", publicController.submitNewWarehouse);
router.post("/contact", publicController.submitContactMessage);
router.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    res.json({ success: true, url: req.file.path });
});

module.exports = router;