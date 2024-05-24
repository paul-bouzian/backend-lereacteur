const Offer = require("../models/Offer");

const isOwner = async (req, res, next) => {
  const offer = await Offer.findById(req.params.id).populate("owner");

  if (!offer) {
    return res.status(404).json({ error: "No offer found." });
  }

  console.log(req.user._id.toString());
  console.log("coucou");
  console.log(offer.owner._id.toString());
  if (req.user._id.toString() !== offer.owner._id.toString()) {
    return res
      .status(401)
      .json({ error: "Unauthorized: You are not the owner of the offer." });
  }
  next();
};

module.exports = isOwner;
