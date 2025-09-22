const express = require("express");
const { login, evalLogin } = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/eval", evalLogin);

module.exports = router;
