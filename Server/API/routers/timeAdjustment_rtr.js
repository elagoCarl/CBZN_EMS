const express = require('express');
const timeAdjust = require('../controllers/timeAdjustment_ctrl');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
// router.use(requireAuth)

router.post('/addTimeAdjustment', timeAdjust.addTimeAdjustment);
router.get('/getAllTimeAdjustment', timeAdjust.getAllTimeAdjustments)
router.get('/getAllTimeAdjustmentByUser/:id', timeAdjust.getAllTimeAdjustmentsByUser)
router.put('/updateTimeAdjustment/:id', timeAdjust.updateTimeAdjustment);
router.delete('/cancelTimeAdjustment/:id', timeAdjust.cancelTimeAdjustment);
router.put('/cancelTimeAdjustment/:id', timeAdjust.cancelTimeAdjustment);
router.post('/getAllTimeAdjustmentCutoffByUser/:id', timeAdjust.getAllTimeAdjustmentCutoffByUser);

module.exports = router;