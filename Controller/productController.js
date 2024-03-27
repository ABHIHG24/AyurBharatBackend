const Product = require("../model/ProductsModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/ApiFeatures");

const { v4: uuidv4 } = require("uuid");
const { query } = require("express");

const getAllProduct = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 10;
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const categories = await Product.distinct("category");
  const companies = await Product.distinct("company");

  const totalPages = Math.ceil(productCount / resultPerPage);
  const currentPage = Number(req.query.page) || 1;

  const data = await apiFeature.query.exec();
  res.json({
    success: true,
    data,
    productCount,
    resultPerPage,
    categories,
    companies,
    totalPages,
    currentPage,
  });
});

const postProduct = catchAsyncErrors(async (req, res, next) => {
  const { title, description, company, category, price } = req.body;

  req.body.user = req.user.id;

  const productId = uuidv4();

  const newProduct = new Product({
    id: productId,
    title,
    description,
    company,
    category,
    image: req.file.filename,
    price,
    stock,
  });

  const savedProduct = await newProduct.save();

  res.json(savedProduct);
});

const updateProduct = catchAsyncErrors(async (req, res, next) => {
  let prod = await Product.findById(req.params.id);
  if (!prod) {
    return next(new ErrorHandler("product not found", 500));
  }
  prod = await Product.findByIdAndUpdate(req.prams.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product: prod,
  });
});

const getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = await Product.findById(id);
  res.json(data);
  if (!data) {
    return next(new ErrorHandler("data not found", 404));
  }
});

const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) {
    return next(new ErrorHandler("product not found", 500));
  }
  await prod.remove();
  res
    .status(200)
    .json({ success: true, message: "product deleted successfully" });
});

const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.username,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.equals(req.user._id)) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReview = product.reviews.length;
  }
  let avg = 0;

  const ratings = product.reviews.map((rev) => rev.rating);
  product.ratings =
    ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const getAllReview = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({ success: true, reviews: product.reviews });
});

const deleteReview = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;

  let ratings = product.reviews.map((rev) => rev.rating);
  ratings = ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;

  const numOfReview = product.reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReview,
    },
    {
      new: true,
      runValidators: true,

      useFindAndModify: false,
    }
  );

  res
    .status(200)
    .json({ success: true, message: "review deleted successfull" });
});

module.exports = {
  getAllProduct,
  postProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllReview,
  deleteReview,
};
