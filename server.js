const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const userRoute = require("./routes/UserRoute");
const productRoute = require("./routes/ProductRoute");
const contactRoute = require("./routes/ContactRoute");
const errorHandler = require("./middlewares/ErrorMiddleware");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://inventory-app-black-nine.vercel.app",
  ],
  credentials: true,
};

/* 
    middlewares
*/
app.use(cors(corsOptions));
app.use(cookieParser());
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contact", contactRoute);

// handling errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// connect to mongodb database
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DB connected and the server is running on port ${PORT}.`);
    });
  })
  .catch((err) => console.log(err));
