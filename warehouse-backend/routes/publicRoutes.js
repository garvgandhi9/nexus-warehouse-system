const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

router.get("/warehouses", publicController.getWarehouses);
router.get("/warehouses/:id", publicController.getWarehouseById);
router.post("/submit", publicController.submitWarehouse);
router.post("/contact", publicController.submitContact);

module.exports = router;