const express = require('express')
const Attendance = require('../controllers/attendance_ctrl')
const router = express.Router()

router.post('/addAttendance', Attendance.addAttendance)
router.get('/getAttendance/:id', Attendance.getAttendanceById)
router.get('/getAllAttendances', Attendance.getAllAttendances)
router.put('/updateAttendance', Attendance.updateAttendance)
router.get('/getAttendanceByUser/:id', Attendance.getAttendancesByUserId)

module.exports = router;