const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

router.get("/warehouses/featured", publicController.getPublicFeaturedWarehouses);
router.get("/cities", publicController.getAvailableCities);
router.get("/warehouses", publicController.getPublicWarehouses);
router.get("/warehouses/:id", publicController.getPublicWarehouseById);
router.post("/submit", publicController.submitNewWarehouse);
router.post("/contact", publicController.submitContactMessage);

module.exports = router;