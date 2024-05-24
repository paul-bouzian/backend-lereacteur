const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");

const articlesByPage = 2;

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;

    let searchOptions = {};
    if (title) {
      searchOptions.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      searchOptions.product_price = {
        ...searchOptions.product_price,
        $gte: priceMin,
      };
    }
    if (priceMax) {
      searchOptions.product_price = {
        ...searchOptions.product_price,
        $lte: priceMax,
      };
    }
    const sortOption =
      sort === "price-asc"
        ? { product_price: "asc" }
        : sort === "price-desc"
        ? { product_price: "desc" }
        : {};
    const pageOption = page > 0 ? page : 1;

    const resultsTab = await Offer.find(searchOptions)
      .sort(sortOption)
      .skip((pageOption - 1) * articlesByPage)
      .limit(articlesByPage)
      .populate("owner");

    res.status(200).json({
      count: resultsTab.length,
      offers: resultsTab,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ error: "No offer found" });
    }

    return res.status(200).json(offer);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
