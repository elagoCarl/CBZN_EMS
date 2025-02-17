const express = require('express');
const schedule = require('../controllers/schedule_ctrl');
const router = express.Router();

router.post('/addSchedule', schedule.addSchedule);
router.get('/getSchedule/:id', schedule.getSchedule)
router.get('/getAllSchedules', schedule.getAllSchedules)
router.put('/updateSchedule/:id', schedule.updateSchedule);
// router.delete('/deleteSchedule/:id', schedule.deleteSchedule);

module.exports = router;