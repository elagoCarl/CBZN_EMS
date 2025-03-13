const express = require('express');
const leaveRequest = require('../controllers/leave_request_ctrl');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
router.use(requireAuth)

router.post('/addLeaveRequest', leaveRequest.addLeaveRequest);
router.get('/getLeaveRequest/:id', leaveRequest.getLeaveRequest);
router.get('/getAllLeaveRequests', leaveRequest.getAllLeaveRequests);
router.get('/getAllLeaveReqsByUser/:id', leaveRequest.getAllLeaveRequestsByUser);
router.put('/updateLeaveRequest/:id', leaveRequest.updateLeaveRequest);
router.put('/cancelLeaveRequest/:id', leaveRequest.cancelLeaveRequest);
// router.delete('/deleteLeaveRequest/:id', leaveRequest.deleteLeaveRequest);


module.exports = router;