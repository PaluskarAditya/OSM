const express = require("express");
const {
  createStream,
  editStream,
  statusStream,
  getAllStreams,
} = require("../controllers/streamController");
const router = express.Router();

router.post("/", createStream);
router.get("/", getAllStreams);
router.put("/:uuid", editStream);
router.put("/:uuid/status", statusStream);

module.exports = router;
