const express = require('express');
const user_ctrl = require('../controllers/user_ctrl');
const router = express.Router();

router.get('/getUser/:id', user_ctrl.getUserById)
router.post('/addUser', user_ctrl.addUser);
router.put('/updateUser/:id', user_ctrl.updateUserById)
router.post('/loginUser', user_ctrl.loginUser);
router.post('/forgotPass', user_ctrl.forgotPass);
router.get('/logoutUser', user_ctrl.logoutUser);
router.get('/test', (req, res) => res.status(200).json({ message: "Test endpoint works" }));



module.exports = router;