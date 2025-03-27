const express = require('express')
const Department = require('../controllers/department_ctrl')
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')
// router.use(requireAuth)

router.post('/addDepartment', Department.addDepartment)
router.get('/getAllDepartment', Department.getAllDepartments)
router.get('/getDepartment/:id', Department.getDepartment)
router.put('/updateDepartment/:id', Department.updateDepartment)
router.delete('/deleteDepartment/:id', Department.deleteDepartment)

module.exports = router;