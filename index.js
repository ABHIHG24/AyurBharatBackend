const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./Middleware/error");
require("dotenv").config({ path: "./config.env" });
app.use(express.json());
app.use(cookieParser());

process.on("uncaughtException", (err) => {
  console.log("Error : ", err.message);
  console.log("Shutting down the server due to UnCaught Exception");
  process.exit(1);
});

const connectDatabase = require("./db");
connectDatabase();

app.use(
  cors({
    origin: "https://ayurbharat.netlify.app", // Allow requests from your Netlify frontend
    credentials: true, // Ensure cookies are included in the request (if needed)
  })
);

app.use("/api/user", require("./router/userRoute"));
app.use("/api/product", require("./router/productRoute"));
app.use("/api/image", express.static(`./upload/`));
app.use("/api/v1/orderRoutes", require("./router/orderRoute"));
app.use("/api/vi/appointments", require("./router/AppointmentRoute"));
app.use("/api/v1", require("./router/paymentRoute"));

app.use(errorMiddleware);

const port = process.env.PORT || 5000;

const server = app.listen(port, () =>
  console.log(`Server is running on port ${port}`)
);

process.on("unhandledRejection", (err) => {
  console.log("Error: ", err.message);
  console.log("Shutting down the server due to unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
