const express = require('express')
const OvertimeRequest = require('../controllers/overtime_request_ctrl');
const { Route53RecoveryCluster } = require('aws-sdk');
const router = express.Router();


router.post('/addOvertimeReq', OvertimeRequest.addOvertimeRequest)
router.get('/getAllOvertimeReq', OvertimeRequest.getAllOvertimeRequests)
router.get('/getAllOTReqsByUser/:id', OvertimeRequest.getAllOTReqsByUser)
router.get('/getOvertimeReq/:id', OvertimeRequest.getOvertimeRequest)
// router.get('/getOvertimeReqbyUID/:user_id', OvertimeRequest.getOvertimeRequestByUID)
router.put('/updateOvertimeReq/:id', OvertimeRequest.updateOvertimeRequest)
router.put('/cancelOvertimeRequest/:id', OvertimeRequest.cancelOvertimeRequest);
//router.delete('/deleteOvertimeReq/:id', OvertimeRequest.deleteOvertimeRequest)


module.exports = router;