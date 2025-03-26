const express = require('express');
const router = express.Router();

const { generateDTRForCutoffByUser } = require('../controllers/dtr_ctrl');

router.get('/test', (req, res) => res.status(200).json({ message: "Test endpoint works" }));
router.post('/generateDTR', generateDTRForCutoffByUser);

module.exports = router;
