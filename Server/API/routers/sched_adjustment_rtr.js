const express = require('express');
const SchedAdjustment = require('../controllers/sched_adjustment_ctrl');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
router.use(requireAuth)

router.post('/addSchedAdjustment', SchedAdjustment.addSchedAdjustment);
router.get('/getAllSchedAdjustments', SchedAdjustment.getAllSchedAdjustments);
router.get('/getAllSchedAdjustmentByUser/:id', SchedAdjustment.getAllSchedAdjustmentByUser);
router.get('/getSchedAdjustmentById/:id', SchedAdjustment.getSchedAdjustmentById);
router.put('/updateSchedAdjustment/:id', SchedAdjustment.updateSchedAdjustment);
router.put('/cancelSchedAdjustment/:id', SchedAdjustment.cancelSchedAdjustment);

module.exports = router;