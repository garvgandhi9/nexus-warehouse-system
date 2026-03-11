const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUser = require("../middleware/verifyUser");

router.get("/warehouses", verifyUser, userController.getWarehouses);
router.put("/warehouses/:id", verifyUser, userController.updateWarehouse);

module.exports = router;