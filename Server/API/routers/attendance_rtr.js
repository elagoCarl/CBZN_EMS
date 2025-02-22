const express = require('express')
const Attendance = require('../controllers/attendance_ctrl')
const router = express.Router()

router.post('/addAttendance', Attendance.addAttendance)
router.get('/getAttendance/:id', Attendance.getAttendanceById)
router.get('/getAllAttendances', Attendance.getAllAttendances)

module.exports = router;