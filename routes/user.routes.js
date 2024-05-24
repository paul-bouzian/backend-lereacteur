const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");

const ResClient = (res, status, message) => {
  res.status(status).json({ message: message });
};

router.post("/signup", fileUpload(), async (req, res) => {
  const { username, email, password, newsletter } = req.body;

  try {
    if (!username || !email || !password) {
      return ResClient(res, 400, "Bad Request");
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return ResClient(res, 400, "This email is already used.");
    }

    const salt = await bcrypt.genSalt(14);
    const hash = await bcrypt.hash(password, salt);
    const token = uuidv4();

    const newUser = new User({
      email,
      account: {
        username,
        avatar: null,
      },
      newsletter,
      token,
      hash,
      salt,
    });

    if (req.files) {
      //upload to cloudinary
      const pictureUploaded = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: `vinted/users/${newUser._id.toString()}`,
        }
      );
      newUser.account.avatar = pictureUploaded.secure_url;
    }

    await newUser.save();
    ResClient(res, 201, newUser);
  } catch (error) {
    console.log(error.message);
    ResClient(res, 500, error.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return ResClient(res, 400, "Bad Request");
    }
    const account = await User.findOne({ email: email });

    if (!account) {
      return ResClient(res, 400, "Email unknown, please create an account.");
    }

    const matchPassword = await bcrypt.compare(password, account.hash);
    if (!matchPassword) {
      return ResClient(res, 400, "Wrong email or password");
    }

    ResClient(res, 200, account);
  } catch (error) {
    console.log(error.message);
    ResClient(res, 500, error.message);
  }
});

module.exports = router;
