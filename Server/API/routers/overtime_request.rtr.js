const express = require('express')
const OvertimeRequest = require('../controllers/overtime_request_ctrl')
const router = express.Router();


router.post('/addOvertimeReq', OvertimeRequest.addOvertimeRequest)
router.get('/getAllOvertimeReq', OvertimeRequest.getAllOvertimeRequests)
router.get('/getAllOTReqsByUser/:id', OvertimeRequest.getAllOTReqsByUser)
router.get('/getOvertimeReq/:id', OvertimeRequest.getOvertimeRequest)
// router.get('/getOvertimeReqbyUID/:id', OvertimeRequest.getOvertimeRequestByUID)
router.put('/updateOvertimeReq/:id', OvertimeRequest.updateOvertimeRequest)



module.exports = router;