const express = require("express");
const {
  create,
  edit,
  status,
  getAll,
  bulk,
} = require("../controllers/academicyearController");
const router = express.Router();

router.post("/", create);
router.post("/bulk", bulk);
router.get("/", getAll);
router.put("/:uuid", edit);
router.put("/:uuid/status", status);

module.exports = router;
