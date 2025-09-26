const express = require('express')
const router = express.Router()
const { create } = require('../controllers/instituteController')

router.post('/', create);
// router.post('/profile', update);

module.exports = router