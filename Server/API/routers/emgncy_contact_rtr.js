const express = require('express');
const EmgncyContact = require('../controllers/emgncy_contact_ctrl');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
// router.use(requireAuth)

router.post('/addEmgncyContact', EmgncyContact.addEmgncyContact);
router.get('/getEmgncyContactById/:id', EmgncyContact.getEmgncyContactById);
router.put('/updateEmgncyContact/:id', EmgncyContact.updateEmgncyContact);

module.exports = router;