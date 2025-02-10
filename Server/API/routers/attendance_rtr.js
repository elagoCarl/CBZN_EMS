const express = require('express')
const Attendance = require('../controllers/attendance_ctrl')
const router = express.Router()

router.post('/addAttendance', Attendance.addAttendance)
router.get('/getAttendance/:id', Attendance.getAttendanceById)
router.get('/getAllAttendances', Attendance.getAllAttendances)
router.delete('/deleteAttendance/:id', Attendance.deleteAttendance)
router.put('/updateAttendance/:id', Attendance.updateAttendance)

module.exports = router;