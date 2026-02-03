const express = require('express');
const { create, getAll } = require('../controllers/requestsController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/request-reset', create);
router.get('/all', authMiddleware, getAll);

module.exports = router;