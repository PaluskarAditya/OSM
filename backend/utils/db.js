const mongoose = require("mongoose");
require("dotenv").config();

const conn = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Error in connecting MongoBD:", err.message);
  }
};
