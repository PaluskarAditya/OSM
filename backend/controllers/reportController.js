const Report = require("../models/reportModel");

const getAll = async (req, res) => {
  try {
    const reports = await Report.find({ IID: req.user.IID });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Could not fetch reports" });
  }
};

module.exports = {
  getAll,
};
