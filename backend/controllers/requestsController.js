const Request = require('../models/requestModel');
const User = require('../models/userModel');

const create = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newRequest = await Request.create({ userId: user._id, IID: user.IID });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
}

const getAll = async (req, res) => {
  try {
    const requests = await Request.find({ IID: req.user.IID })

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

module.exports = {
  create,
  getAll,
};