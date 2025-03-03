const express = require('express');
const leaveRequest = require('../controllers/leave_request_ctrl');
const router = express.Router();

router.post('/addLeaveRequest', leaveRequest.addLeaveRequest);
router.get('/getLeaveRequest/:id', leaveRequest.getLeaveRequest);
router.get('/getAllLeaveRequests', leaveRequest.getAllLeaveRequests);
// router.get('/getAllLeaveReqsByUser/:id', leaveRequest.getAllLeaveReqsByUser);
router.put('/updateLeaveRequest/:id', leaveRequest.updateLeaveRequest);
// router.delete('/deleteLeaveRequest/:id', leaveRequest.deleteLeaveRequest);


module.exports = router;