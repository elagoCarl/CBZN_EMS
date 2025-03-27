const express = require('express')
const JobTitle = require('../controllers/job_title_ctrl')
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
// router.use(requireAuth)

router.post('/addJobTitle', JobTitle.addJobTitle)
router.get('/getAllJobTitle', JobTitle.getAllJobTitles)
router.get('/getJobTitle/:id', JobTitle.getJobTitle)
router.put('/updateJobTitle/:id', JobTitle.updateJobTitle)
router.delete('/deleteJobTitle/:id', JobTitle.deleteJobTitle)


module.exports = router;