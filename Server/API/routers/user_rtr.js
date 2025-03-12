 const express = require('express');
const user_ctrl = require('../controllers/user_ctrl');
const upload = require('../../upload');
const router = express.Router();

router.get('/getUser/:id', user_ctrl.getUserById)
router.post('/addUser', user_ctrl.addUser);
router.put('/updateUser/:id', user_ctrl.updateUserById)
router.put('/updateUserPassword/:id', user_ctrl.updateUserPassword)
router.put('/updateUserEmail/:id', user_ctrl.updateUserEmail)
router.post('/loginUser', user_ctrl.loginUser);
router.post('/forgotPass', user_ctrl.forgotPass);
router.get('/logoutUser', user_ctrl.logoutUser);
router.get('/getAllUsers', user_ctrl.getAllUsers);
router.get('/getProfilePic/:id', user_ctrl.getProfilePic)
router.get('/test', (req, res) => res.status(200).json({ message: "Test endpoint works" }));
router.get('/getAllUsersWithJob', user_ctrl.getAllUsersWithJob)
router.post('/uploadProfilePicture/:id', upload.single('profilePic'), user_ctrl.uploadProfilePic);


module.exports = router;