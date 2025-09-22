const express = require("express");
const {
  createDegree,
  editDegree,
  statusDegree,
  getAllDegrees,
  bulkDegree,
} = require("../controllers/degreeController");
const router = express.Router();

router.post("/", createDegree);
router.post("/bulk", bulkDegree);
router.get("/", getAllDegrees);
router.put("/:uuid", editDegree);
router.put("/:uuid/status", statusDegree);

module.exports = router;
