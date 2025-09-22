const express = require("express");
const {
  getAll,
  upload,
  update,
  attendance,
  subjects,
} = require("../controllers/candidateController");
const router = express.Router();

router.get("/", getAll);
router.post("/upload", upload);
router.put("/status", update);
router.put("/attendance", attendance);
router.put("/subjects", subjects);

module.exports = router;
