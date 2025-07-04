const express = require("express");
const ErrorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const app = express();

// Load env variables early
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/.env" });
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Static file serving
app.use("/", express.static("uploads"));

// Import routes
const user = require("./controller/user");
// const paymentRoute = require("./routes/payment"); // payment route import kiya

// Use routes
app.use("/api/v2/user", user);
// app.use("/payment", paymentRoute); 

// Error handler
app.use(ErrorHandler);

module.exports = app;
