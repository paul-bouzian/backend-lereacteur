const express = require("express");
const app = express();
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.routes");
const offerRoutes = require("./routes/offer.routes");
const offersRoutes = require("./routes/offers.routes");

//Import de cloudinary pour pouvoir upload les fichiers

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "djj10svfl",
  api_key: "931226441616792",
  api_secret: "xrAXbGPASKZzcP00cpBrjX5G9Eg",
});

//connexion à la BDD

mongoose.connect("mongodb://localhost:27017/vinted");

//utilisation des différentes routes

app.use(express.json());
app.use("/user", userRoutes);
app.use("/offer", offerRoutes);
app.use(offersRoutes);

//si l'utilisateur s'est perdu

app.all("*", (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

app.listen(3000, () => {
  console.log("server connected");
});
