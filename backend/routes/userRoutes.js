const express = require('express');
const { createUser, getUsers, observerPermissions, getObserverPermissions, resetPassword } = require('../controllers/userController');
const router = express.Router();

router.post('/', createUser);
router.get('/', getUsers);
router.put('/permissions/:userId', observerPermissions);
router.put('/reset-password/:userId', resetPassword);
router.get('/permissions/:userId', getObserverPermissions);

module.exports = router;