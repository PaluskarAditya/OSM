const express = require("express");
const {
  login,
  evalLogin,
  changePass,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/login", login);
router.post("/eval", evalLogin);
router.put("/change-pass", authMiddleware, changePass);

module.exports = router;
