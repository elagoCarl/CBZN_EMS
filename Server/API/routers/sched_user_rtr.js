const express = require('express');
const SchedUser = require('../controllers/sched_user_ctrl');
const router = express.Router();

router.post('/addSchedUser', SchedUser.addSchedUser);
router.get('/getAllSchedUsers', SchedUser.getAllSchedUser);
router.get('/getSchedUserById/:id', SchedUser.getSchedUser);
router.put('/updateSchedUser/:id', SchedUser.updateSchedUser);

module.exports = router;