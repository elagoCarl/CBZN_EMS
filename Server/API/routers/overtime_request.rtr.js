const express = require('express')
const OvertimeRequest = require('../controllers/overtime_request_ctrl')
const router = express.Router();


router.post('/addOvertimeReq', OvertimeRequest.addOvertimeRequest)
router.get('/getAllOvertimeReq', OvertimeRequest.getAllOvertimeRequests)
router.get('/getOvertimeReq/:id', OvertimeRequest.getOvertimeRequest)
router.get('/getOvertimeReqbyUID/:user_id', OvertimeRequest.getOvertimeRequestByUID)
router.put('/updateOvertimeReq/:id', OvertimeRequest.updateOvertimeRequest)
router.delete('/deleteOvertimeReq/:id', OvertimeRequest.deleteOvertimeRequest)


module.exports = router;