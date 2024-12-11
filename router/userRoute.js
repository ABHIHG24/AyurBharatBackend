const express = require("express");
const router = express.Router();
const user = require("../Controller/userController");
const { restrict, isAuthenticatedUser } = require("../Middleware/auth");

router.post("/insert", user.userInsert);
router.post("/login", user.login);
router.get("/logout", user.Logout);
router.get("/me", isAuthenticatedUser, user.getUserDetails);
router.put("/me/update", isAuthenticatedUser, user.updateProfile);

router.post("/forgetPassword", user.forgetPassword);
router.put("/resetPassword/:token", user.passwordReset);
router.put("/password/update", isAuthenticatedUser, user.updateUserPassword);

router.get(
  "/admin/users",
  isAuthenticatedUser,
  restrict("admin"),
  user.getAllUsers
);
router.get(
  "/admin/user/:id",
  isAuthenticatedUser,
  restrict("admin"),
  user.getUsers
);
router.put(
  "/admin/user/:id",
  isAuthenticatedUser,
  restrict("admin"),
  user.updateUserRole
);

router.delete(
  "/admin/user/:id",
  isAuthenticatedUser,
  restrict("admin"),
  user.deleteUser
);

module.exports = router;
