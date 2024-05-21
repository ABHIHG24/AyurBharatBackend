const express = require("express");
const router = express.Router();
const product = require("../Controller/productController");
const multer = require("multer");
const { restrict, isAuthenticatedUser } = require("../Middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
router.get("/getAllProduct", product.getAllProduct);
router.get("/getSingleProduct/:id", product.getSingleProduct);
router.post(
  "/insertProduct",
  upload.single("image"),
  isAuthenticatedUser,
  restrict("admin"),
  product.postProduct
);

router.put(
  "/updateProduct/:id",
  isAuthenticatedUser,
  upload.single("image"),
  restrict("admin"),
  product.updateProduct
);
router.delete(
  "/deleteProduct/:id",
  isAuthenticatedUser,
  restrict("admin"),
  product.deleteProduct
);

router.get(
  "/admin/products",
  isAuthenticatedUser,
  restrict("admin"),
  product.getAllProductAdmin
);

router.put("/review", isAuthenticatedUser, product.createProductReview);
router.get("/reviews", isAuthenticatedUser, product.getAllReview);
router.delete("/reviews", isAuthenticatedUser, product.deleteReview);
module.exports = router;
