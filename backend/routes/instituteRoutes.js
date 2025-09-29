const express = require('express')
const router = express.Router()
const { create, getAll } = require('../controllers/instituteController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', create);
router.get('/', authMiddleware, getAll);
// router.post('/profile', update);

module.exports = router