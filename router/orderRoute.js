const express = require("express");
const router = express.Router();
const orders = require("../Controller/orderController");
const { restrict, isAuthenticatedUser } = require("../Middleware/auth");

router.post("/order/new", isAuthenticatedUser, orders.newOrders);
router.get("/order/:id", isAuthenticatedUser, orders.getSingleOrder);
router.get("/orders/me", isAuthenticatedUser, orders.myOrders);
router.get(
  "/admin/orders",
  isAuthenticatedUser,
  restrict("admin"),
  orders.getAllOrders
);
router.delete(
  "/admin/order/:id",
  isAuthenticatedUser,
  restrict("admin"),
  orders.deleteOrder
);
router.put(
  "/admin/order/:id",
  isAuthenticatedUser,
  restrict("admin"),
  orders.updateOrderStatus
);

module.exports = router;
