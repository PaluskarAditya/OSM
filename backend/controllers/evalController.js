const Evaluation = require("../models/evalModel");
const generate = require("../lib/generate");

// ✅ Create Evaluation
const createEvaluation = async (req, res) => {
  try {
    const evalExist = await Evaluation.findOne({ name: req.body.name });

    if (evalExist) {
      return res.status(400).json({ err: "Evaluation already exists" });
    }

    const evaluation = new Evaluation({
      ...req.body,
      uuid: generate(),
      createdBy: req.user?._id, // assuming middleware sets req.user
    });

    await evaluation.save();

    res.status(201).json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Edit Evaluation
const editEvaluation = async (req, res) => {
  try {
    const { uuid } = req.params;

    const evaluation = await Evaluation.findOneAndUpdate(
      { uuid },
      { ...req.body },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Update Status
const statusEvaluation = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { status } = req.body;

    const evaluation = await Evaluation.findOneAndUpdate(
      { uuid },
      { status },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Assign Examiners / Moderators
const assignUsers = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { examiners, moderators } = req.body;

    const evaluation = await Evaluation.findOneAndUpdate(
      { uuid },
      {
        $addToSet: {
          examiners: { $each: examiners || [] },
          moderators: { $each: moderators || [] },
        },
      },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Get Evaluations by Examiner
const getByExaminer = async (req, res) => {
  try {
    const { examinerId } = req.params;
    const evaluations = await Evaluation.find({ examiners: examinerId })
      .populate("sheets")
      .populate("moderators");

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Get evaluation by uuid
const getEvaluationByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;

    const evaluation = await Evaluation.findById(uuid)
      .populate("examiners", "FirstName LastName Email")
      .populate("moderators", "FirstName LastName Email")
      .populate("sheets"); // if you want to expand AnswerSheet docs instead of just assignmentIds

    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Evaluations by Moderator
const getByModerator = async (req, res) => {
  try {
    const { moderatorId } = req.params;
    const evaluations = await Evaluation.find({ moderators: moderatorId })
      .populate("sheets")
      .populate("examiners");

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Get Evaluations by Creator (Admin)
const getByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const evaluations = await Evaluation.find({ createdBy: creatorId })
      .populate("sheets")
      .populate("examiners")
      .populate("moderators");

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Delete Evaluation
const deleteEvaluation = async (req, res) => {
  try {
    const { uuid } = req.params;

    const evaluation = await Evaluation.findOneAndDelete({ uuid });

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    res.status(200).json({ success: true, msg: "Evaluation deleted" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  createEvaluation,
  editEvaluation,
  statusEvaluation,
  assignUsers,
  getByExaminer,
  getByModerator,
  getByCreator,
  deleteEvaluation,
  getEvaluationByUuid,
};
