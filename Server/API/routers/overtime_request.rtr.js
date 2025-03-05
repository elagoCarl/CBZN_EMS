const express = require('express')
const OvertimeRequest = require('../controllers/overtime_request_ctrl')
const router = express.Router();


router.post('/addOvertimeReq', OvertimeRequest.addOvertimeRequest)
router.get('/getAllOvertimeReq', OvertimeRequest.getAllOvertimeRequests)
router.get('/getAllOTReqsByUser/:id', OvertimeRequest.getAllOTReqsByUser)
router.get('/getOvertimeReq/:id', OvertimeRequest.getOvertimeRequest)
router.put('/updateOvertimeReq/:id', OvertimeRequest.updateOvertimeRequest)
router.put('/cancelOvertimeReq/:id', OvertimeRequest.cancelOvertimeRequest)
// router.get('/getOvertimeReqbyUID/:user_id', OvertimeRequest.getOvertimeRequestByUID)
//router.delete('/deleteOvertimeReq/:id', OvertimeRequest.deleteOvertimeRequest)


module.exports = router;