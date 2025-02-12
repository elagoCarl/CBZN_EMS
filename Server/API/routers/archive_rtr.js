const express = require('express');
const Archive = require('../controllers/archive_ctrl');
const router = express.Router();

router.post('/addArchive/:id', Archive.addArchive);
router.get('/getArchive/:id', Archive.getArchive);
router.get('/getAllArchives', Archive.getAllArchives);
module.exports = router;