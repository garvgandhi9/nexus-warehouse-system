const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUser = require("../middleware/verifyUser");

router.get("/warehouses", verifyUser, userController.getUserWarehouses);
router.put("/warehouses/:id", verifyUser, userController.updateUserWarehouse);

module.exports = router;