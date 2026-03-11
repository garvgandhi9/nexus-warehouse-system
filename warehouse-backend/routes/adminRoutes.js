const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/warehouses", verifyAdmin, adminController.getWarehouses);
router.get("/users", verifyAdmin, adminController.getUsers);
router.get("/messages", verifyAdmin, adminController.getMessages);
router.put("/approve/:id", verifyAdmin, adminController.approveWarehouse);
router.delete("/delete/:id", verifyAdmin, adminController.deleteWarehouse);
router.delete("/messages/:id", verifyAdmin, adminController.deleteMessage);

module.exports = router;