const express = require('express');
const leaveRequest = require('../controllers/leave_request_ctrl');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
router.use(requireAuth)

router.post('/addLeaveRequest', leaveRequest.addLeaveRequest);
router.get('/getLeaveRequest/:id', leaveRequest.getLeaveRequest);
router.get('/getAllLeaveRequests', leaveRequest.getAllLeaveRequests);
router.put('/updateLeaveRequest/:id', leaveRequest.updateLeaveRequest);
router.put('/cancelLeaveRequest/:id', leaveRequest.cancelLeaveRequest);
// router.delete('/deleteLeaveRequest/:id', leaveRequest.deleteLeaveRequest);
router.post('/getAllLeaveRequestCutoffByUser/:id', leaveRequest.getAllLeaveCutoffByUser);
router.get('/getAllLeaveRequestsByUser/:id', leaveRequest.getAllLeaveRequestsByUser);


module.exports = router;