const syncEvaluation = require("../lib/sync");
const Inward = require("../models/inwardModel");

const create = async (req, res) => {
  try {
    const { degree, course, subject, examDate } = req.body;

    const exist = await Inward.findOne({ degree, course, subject, examDate });
    if (exist) {
      return res
        .status(400)
        .json({ error: "Inward already exists for this subject and date" });
    }

    const inward = new Inward({ ...req.body });
    await inward.save();

    await syncEvaluation(course, subject, req.user?._id);

    res.status(201).json({ success: true, inward });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const inwards = await Inward.find();

    if (!inwards) return res.status(500).json({ err: "No Inwards found" });

    res.status(200).json(inwards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  getAll,
};
