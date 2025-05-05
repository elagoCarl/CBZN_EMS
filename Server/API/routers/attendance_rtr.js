const express = require('express')
const Attendance = require('../controllers/attendance_ctrl')
const router = express.Router()
const { requireAuth } = require('../controllers/authMiddleware')
router.use(requireAuth)

router.post('/addAttendance/:id', Attendance.addAttendance)
router.get('/getAttendance/:id', Attendance.getAttendanceById)
router.get('/getAllAttendances', Attendance.getAllAttendances)
router.put('/updateAttendance/:id', Attendance.updateAttendance)
router.get('/getAttendanceByUser/:id', Attendance.getAttendancesByUserId)
router.post('/getAllAttendanceCutoffByUser/:id', Attendance.getAllAttendanceCutoffByUser)

module.exports = router;