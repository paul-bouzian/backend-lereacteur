const express = require("express");
const app = express();
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.routes");
const offerRoutes = require("./routes/offer.routes");
const offersRoutes = require("./routes/offers.routes");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "djj10svfl",
  api_key: "931226441616792",
  api_secret: "xrAXbGPASKZzcP00cpBrjX5G9Eg",
});

mongoose.connect("mongodb://localhost:27017/vinted");

app.use(express.json());
app.use("/user", userRoutes);
app.use("/offer", offerRoutes);
app.use(offersRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

app.listen(3000, () => {
  console.log("server connected");
});
