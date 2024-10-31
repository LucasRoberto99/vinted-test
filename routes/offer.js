const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

const convertToBase64 = require("../utils/convertToBase64");

const fileupload = require("express-fileupload");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      // console.log(req.body);
      // console.log(req.files);

      // le destructuring

      // const { title } = req.body; // je crée une variable title qui contient ce que contient req.body.title
      // // console.log(title);
      // const { description } = req.body; // je crée une variable description qui contient ce que contient req.body.description
      //  console.log(description);

      // const { banane } = req.body; // si la clé n'existe pas ? unedefined
      // console.log(banane);

      // const title = req.body.title;

      const { title, description, price, brand, city, size, condition, color } =
        req.body;

      const picture = req.files.picture;

      // console.log(picture);

      const savedPicture = await cloudinary.uploader.upload(
        convertToBase64(picture)
      );

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          { COULEUR: color },
          {
            EMPLACEMENT: city,
          },
        ],
        product_image: savedPicture,
        owner: req.user._id,
      });

      console.log(newOffer);

      await newOffer.save();

      res.json(newOffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    // REGEXP
    // Je vais chercher dans la collection Offer, toutes les offres dont la clef product_name contient bonnet

    // const regExp = new RegExp("bonnet", "i");

    // // console.log(regExp); // /bonnet/

    // const offer = await Offer.find({
    //   product_name: regExp,
    // }).select("product_name product_price -_id");

    // FIND AVEC FOURCHETTES DE PRIX
    // je veux par exemple toutes les offres dont la clé price est supérieur ou égal à 50 !

    // >= $gte
    // > $gt
    // <= $lte
    // < $lt

    // const offer = await Offer.find({
    //   product_price: { $gte: 50, $lte: 500 },
    //   //   product_name: /bonnet/i,
    // }).select("product_name product_price -_id");

    // TRIER PAR ORDRE

    // croissant : asc OU 1
    // décroissant desc ou -1

    // const offer = await Offer.find()
    //   .sort({ product_price: -1 })
    //   .select("product_name product_price -_id");

    // SKIP ET LIMIT

    // const offer = await Offer.find()
    //   .skip(3)
    //   .limit(3)
    //   .select("product_name product_price -_id");

    // ON PEUT TOUT CHAINER !!!

    const offer = await Offer.find({
      product_name: /bonnet/i,
      product_price: { $gt: 50 },
    })
      .sort({ product_price: -1 })
      .skip(0)
      .limit(20)
      .select("product_name product_price -_id");

    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
