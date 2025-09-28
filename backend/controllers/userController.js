const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  try {
    const { Email, password } = req.body;

    const exists = await User.findOne({ Email });

    if (exists) {
      res.status(500).json({ err: "User already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      ...req.body,
      password: hashed,
    });

    await user.save();

    if (user) {
      console.log("new user created");

      const userObj = user.toObject();
      delete userObj.password;

      res.status(200).json(userObj);
      return;
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ iid: req.user.IID });

    if (!users) {
      return res.status(500).json({ err: "Users not found" });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
};
