const express = require('express');
const user_ctrl = require('../controllers/user_ctrl');
const upload = require('../../upload');
const router = express.Router();
const { requireAuth } = require('../controllers/authMiddleware')

// Remove this line that applies requireAuth to all routes
// router.use(requireAuth)

// Public routes (no authentication required)

router.post('/loginUser', user_ctrl.loginUser);
router.post('/forgotPass', user_ctrl.forgotPass);
router.get('/test', (req, res) => res.status(200).json({ message: "Test endpoint works" }));


//temp
router.post('/addUser', user_ctrl.addUser);
router.get('/getUser/:id',  user_ctrl.getUserById);
router.put('/updateUser/:id',  user_ctrl.updateUserById);
router.put('/updateUserPassword/:id',  user_ctrl.updateUserPassword);
router.put('/updateUserEmail/:id',  user_ctrl.updateUserEmail);
router.post('/logoutUser',  user_ctrl.logoutUser);
router.get('/getAllUsers',  user_ctrl.getAllUsers);
router.get('/getProfilePic/:id',  user_ctrl.getProfilePic);
router.get('/getCurrentUser',  user_ctrl.getCurrentUser);
router.get('/getAllUsersWithJob',  user_ctrl.getAllUsersWithJob);
router.post('/uploadProfilePicture/:id',  upload.single('profilePic'), user_ctrl.uploadProfilePic);




// Protected routes (authentication required)
// router.post('/addUser',requireAuth, user_ctrl.addUser);
// router.get('/getUser/:id', requireAuth, user_ctrl.getUserById);
// router.put('/updateUser/:id', requireAuth, user_ctrl.updateUserById);
// router.put('/updateUserPassword/:id', requireAuth, user_ctrl.updateUserPassword);
// router.put('/updateUserEmail/:id', requireAuth, user_ctrl.updateUserEmail);
// router.post('/logoutUser', requireAuth, user_ctrl.logoutUser);
// router.get('/getAllUsers', requireAuth, user_ctrl.getAllUsers);
// router.get('/getProfilePic/:id', requireAuth, user_ctrl.getProfilePic);
// router.get('/getCurrentUser', requireAuth, user_ctrl.getCurrentUser);
// router.get('/getAllUsersWithJob', requireAuth, user_ctrl.getAllUsersWithJob);
// router.post('/uploadProfilePicture/:id', requireAuth, upload.single('profilePic'), user_ctrl.uploadProfilePic);

module.exports = router;