const express = require("express");
const {
  createEvaluation,
  editEvaluation,
  statusEvaluation,
  assignUsers,
  getByExaminer,
  getByModerator,
  getByCreator,
  deleteEvaluation,
  getEvaluationByUuid,
  status,
  getAll,
} = require("../controllers/evalController");

const router = express.Router();

// Create
router.post("/", createEvaluation);

router.get('/', getAll);

// Edit
router.put("/:uuid", editEvaluation);

router.put("/status/:uuid", status);

// Get By ID
router.get("/:uuid", getEvaluationByUuid);

// Update status
router.put("/:uuid/status", statusEvaluation);

// Assign examiners/moderators
router.put("/:uuid/assign", assignUsers);

// Get by examiner
router.get("/examiner/:examinerId", getByExaminer);

// Get by moderator
router.get("/moderator/:moderatorId", getByModerator);

// Get by creator
router.get("/creator/:creatorId", getByCreator);

// Delete
router.delete("/:uuid", deleteEvaluation);

module.exports = router;
