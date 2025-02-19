const express = require('express');
const SchedAdjustment = require('../controllers/sched_adjustment_ctrl');
const router = express.Router();

router.post('/addSchedAdjustment', SchedAdjustment.addSchedAdjustment);
// router.get('/getEmgncyContactById/:id', SchedAdjustment.getEmgncyContactById);
router.put('/updateEmgncyContact/:id', SchedAdjustment.updateSchedAdjustment);

module.exports = router;