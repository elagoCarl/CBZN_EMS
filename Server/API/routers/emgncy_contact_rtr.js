const express = require('express');
const EmgncyContact = require('../controllers/emgncy_contact_ctrl');
const router = express.Router();

router.post('/addEmgncyContact', EmgncyContact.addEmgncyContact);

module.exports = router;