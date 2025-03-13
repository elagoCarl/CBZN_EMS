const express = require('express');
const userInfo = require('../controllers/user_info_ctrl');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
router.use(requireAuth)

router.post('/addUserInfo', userInfo.addUserInfo);
router.put('/updateUserInfo', userInfo.updateUserInfo);
router.get('/getUserInfoById/:id', userInfo.getUserInfoById);

module.exports = router;