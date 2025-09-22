const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV;

const login = async (req, res) => {
  try {
    const { role, uname, pass } = req.body;

    const user = await User.findOne({ Role: role, Email: uname });

    if (!user) {
      res.status(500).json({ err: "User not found" });
      return;
    }

    if (user.Role !== role) {
      res
        .status(500)
        .json({ err: "User role mismatch, please login with proper rights" });
      return;
    }

    const compare = await bcrpyt.compare(pass, user.password);

    if (compare) {
      res.status(200).json({
        success: true,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        }),
        role: user.Role,
        mail: user.Email,
      });
      return;
    }

    res.status(500).json({ err: "Invalid Username or Password" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const evalLogin = async (req, res) => {
  try {
    const { uname, pass } = req.body;

    const user = await User.findOne({ Email: uname });

    if (!user) {
      res.status(500).json({ err: "User not found" });
      return;
    }

    if (user.Role !== "Examiner" && user.Role !== "Moderator") {
      res
        .status(500)
        .json({ err: "User role mismatch, please login with proper rights" });
      return;
    }

    const compare = await bcrpyt.compare(pass, user.password);

    if (compare) {
      res.status(200).json({
        success: true,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        }),
        role: user.Role,
        mail: user.Email,
      });
      return;
    }

    res.status(500).json({ err: "Invalid Username or Password" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  login,
  evalLogin,
};
