const express = require('express');
const cutoffController = require('../controllers/cutoff_ctrl');
const router = express.Router();

router.post('/addCutoff', cutoffController.addCutoff);
router.get('/getCutoffById/:id', cutoffController.getCutoffById);
router.put('/updateCutoff/:id', cutoffController.updateCutoff);
router.get('/getAttendancesByCutoff/:id', cutoffController.getAttendancesByCutoff);
router.get('/getAllCutoff', cutoffController.getAllCutoff)

module.exports = router;
