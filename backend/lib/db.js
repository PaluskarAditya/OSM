const mongoose = require("mongoose");
require("dotenv").config();

const conn = async () => {
  mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
};

module.exports = conn;
