const express = require("express");
const router = express.Router();
const {
  getAllCrypto,
  getGainers,
  getNewListings,
  addCrypto,
} = require("../controllers/cryptoController");

router.get("/gainers", getGainers);
router.get("/new", getNewListings);
router.get("/", getAllCrypto);
router.post("/", addCrypto);

module.exports = router;
