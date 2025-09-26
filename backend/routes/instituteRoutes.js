const express = require('express')
const router = express.Router()
const { create, getAll } = require('../controllers/instituteController')

router.post('/', create);
router.get('/', getAll);
// router.post('/profile', update);

module.exports = router