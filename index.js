require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.routes");
const offerRoutes = require("./routes/offer.routes");
const offersRoutes = require("./routes/offers.routes");

//Import de cloudinary pour pouvoir upload les fichiers

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//connexion à la BDD

mongoose.connect(process.env.MONGODB_URI);

//utilisation des différentes routes

app.use(express.json());
app.use("/user", userRoutes);
app.use("/offer", offerRoutes);
app.use(offersRoutes);

//si l'utilisateur s'est perdu

app.all("*", (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("server connected");
});
