const Crypto = require("../models/Crypto");

const getAllCrypto = async (req, res) => {
  try {
    const cryptos = await Crypto.find().sort({ createdAt: -1 });
    res.json({ cryptos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cryptocurrencies." });
  }
};

const getGainers = async (req, res) => {
  try {
    const gainers = await Crypto.find({ change24h: { $gt: 0 } }).sort({ change24h: -1 });
    res.json({ cryptos: gainers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch top gainers." });
  }
};

const getNewListings = async (req, res) => {
  try {
    const newListings = await Crypto.find().sort({ createdAt: -1 }).limit(10);
    res.json({ cryptos: newListings });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch new listings." });
  }
};

const addCrypto = async (req, res) => {
  try {
    const { name, symbol, price, image, change24h } = req.body;

    if (!name || !symbol || price === undefined || change24h === undefined) {
      return res.status(400).json({
        message: "Please provide name, symbol, price, and change24h.",
      });
    }

    const existing = await Crypto.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: `${symbol.toUpperCase()} already exists.` });
    }

    const crypto = await Crypto.create({ name, symbol, price, image, change24h });

    res.status(201).json({
      message: `${crypto.name} added successfully.`,
      crypto,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Failed to add cryptocurrency." });
  }
};

module.exports = { getAllCrypto, getGainers, getNewListings, addCrypto };
