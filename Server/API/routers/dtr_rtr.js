const express = require('express');
const DTR = require('../controllers/dtr_ctrl')
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
// router.use(requireAuth)

router.get('/test', (req, res) => res.status(200).json({ message: "Test endpoint works" }));
router.post('/generateDTR', DTR.generateDTRForCutoffByUser);
router.get('/getAllDTR', DTR.getAllDTR);
router.post('/getAllDTRCutoffByUser', DTR.getAllDTRCutoffByUser);

module.exports = router;
