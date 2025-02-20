const express = require('express');
const timeAdjust = require('../controllers/timeAdjustment_ctrl');
const router = express.Router();

router.post('/addTimeAdjustment', timeAdjust.addTimeAdjustment);
router.get('/getAllTimeAdjustment', timeAdjust.getAllTimeAdjustments)
router.get('/getAllTimeADjustmentByUser/:id', timeAdjust.getAllTimeAdjustmentsByUser)
router.put('/updateTimeAdjustment/:id', timeAdjust.updateTimeAdjustment);
router.delete('/cancelTimeAdjustment/:id', timeAdjust.cancelTimeAdjustment);

module.exports = router;