const express = require('express');
const leaveInfo = require('../controllers/leave_info_ctrl');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
router.use(requireAuth)

router.post('/addLeaveInfo', leaveInfo.addLeaveInfo);
router.get('/getLeaveInfo/:id', leaveInfo.getLeaveInfo);
router.get('/getAllLeaveInfos', leaveInfo.getAllLeaveInfos);
router.put('/updateLeaveInfo/:id', leaveInfo.updateLeaveInfo);



module.exports = router;