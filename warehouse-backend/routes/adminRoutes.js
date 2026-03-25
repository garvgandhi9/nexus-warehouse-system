const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/warehouses", verifyAdmin, adminController.getAdminWarehouses);
router.put("/warehouses/:id", verifyAdmin, adminController.updateWarehouse);
router.post("/warehouses", verifyAdmin, adminController.createWarehouse);
router.get("/users", verifyAdmin, adminController.getUsers);
router.put("/users/:id", verifyAdmin, adminController.updateUser);
router.delete("/users/:id", verifyAdmin, adminController.deleteUser);
router.get("/messages", verifyAdmin, adminController.getAdminMessages);
router.put("/approve/:id", verifyAdmin, adminController.approveWarehouseListing);
router.delete("/delete/:id", verifyAdmin, adminController.deleteWarehouseListing);
router.delete("/messages/:id", verifyAdmin, adminController.deleteContactMessage);

module.exports = router;