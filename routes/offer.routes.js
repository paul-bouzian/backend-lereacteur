const express = require("express");
const Offer = require("../models/Offer");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const router = express.Router();

const cloudinary = require("cloudinary").v2;

router.post("/publish", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    const picture = req.files ? req.files.picture : undefined;

    if (
      !title ||
      !description ||
      !price ||
      !condition ||
      !city ||
      !brand ||
      !size ||
      !color ||
      !picture
    ) {
      return res.status(400).json({ message: "Bad request" });
    }

    if (description.length > 500) {
      return res
        .status(400)
        .json({ error: "Description should not exceed 500 characters." });
    }

    if (title.length > 50) {
      return res
        .status(400)
        .json({ error: "Title should not exceed 50 characters." });
    }

    if (price > 100000) {
      return res
        .status(400)
        .json({ error: "Price should not exceed $100 000." });
    }

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: {
        MARQUE: brand,
        TAILLE: size,
        ETAT: condition,
        COULEUR: color,
        EMPLACEMENT: city,
      },
      owner: req.user,
    });

    await newOffer.save();

    //uplod to cloudinary
    const pictureUploaded = await cloudinary.uploader.upload(
      convertToBase64(picture),
      {
        folder: `vinted/offers/${newOffer._id.toString()}`,
      }
    );

    newOffer.product_image = pictureUploaded.secure_url;

    await newOffer.save();

    res.status(201).json(newOffer);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

router.put("/:id", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send("No id given");
    }

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    //Modification des infos sauf image
    Object.keys(req.body).forEach((key) => {
      switch (key) {
        case "title":
          if (req.body[key].length > 50) {
            return res
              .status(400)
              .send("Title should not exceed 50 characters.");
          }
          offer.product_name = req.body[key];
          break;

        case "description":
          if (req.body[key].length > 500) {
            return res
              .status(400)
              .send("Description should not exceed 500 characters.");
          }
          offer.product_description = req.body[key];
          break;

        case "price":
          if (req.body[key] > 100000) {
            return res.status(400).send("Price should not exceed $100 000.");
          }
          offer.product_price = req.body[key];
          break;

        case "brand":
          offer.product_details[MARQUE] = req.body[key];
          break;

        case "size":
          offer.product_details[TAILLE] = req.body[key];
          break;

        case "condition":
          offer.product_details[ETAT] = req.body[key];
          break;

        case "color":
          offer.product_details[COULEUR] = req.body[key];
          break;

        case "city":
          offer.product_details[EMPLACEMENT] = req.body[key];
          break;
      }
    });

    if (req.files) {
      //Upload de la nouvelle image
      const newImage = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: `vinted/offers/${offer._id.toString()}`,
        }
      );

      // Supprimer tout jusqu'à "vinted/"
      let startIndex = offer.product_image.indexOf("vinted/");
      let urlToDestroy = offer.product_image.substring(startIndex);

      // Supprimer l'extension à la fin
      urlToDestroy = urlToDestroy.substring(0, urlToDestroy.lastIndexOf("."));

      // Détruire l'image
      await cloudinary.uploader.destroy(urlToDestroy);

      //Enresgistrer la nouvelle URL
      offer.product_image = newImage.secure_url;
    }

    await offer.save();
    res.status(200).send("Offer successfully modified!");
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error.message);
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send("No id given");
    }

    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    res.status(200).send("Offer deleted!");
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error.message);
  }
});

module.exports = router;
