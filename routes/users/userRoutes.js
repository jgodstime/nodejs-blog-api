const express = require('express');
const storage = require('../../config/cloudinary');
const { userRegister, userLogin, allUsers, userProfile, updateUser, profilePhotoUpload, whoViewedMyProfile, following, unfollow, blockUser, unBlockUser, adminBlockUser, adminUnBlockUser, updatePassword, deleteUserAccount } = require('../../controllers/users/userContoller');
const isLogin = require('../../middlewares/isLogin');
const multer = require('multer');
const isAdmin = require('../../middlewares/isAdmin');

// instance of multer
const upload = multer({ storage });


const userRouter = express.Router();

//POST/api/v1/users/register
userRouter.post('/register',userRegister);


//POST/api/v1/users/login
userRouter.post('/login', userLogin);


//GET/api/v1/users
userRouter.get('/', allUsers);


//GET/api/v1/users/profile/:id
userRouter.get('/profile', isLogin, userProfile);


//PUT/api/v1/users/:id
userRouter.put('/', isLogin, updateUser);


//GET/api/v1/users/profile-viewers/:id
userRouter.get('/profile-viewers/:id',isLogin, whoViewedMyProfile);

//GET/api/v1/users/following/:id
userRouter.get('/following/:id', isLogin, following);

//GET/api/v1/users/unfollowing/:id
userRouter.get('/unfollowing/:id', isLogin, unfollow);

//GET/api/v1/users/block/:id
userRouter.get('/block/:id', isLogin, blockUser);

//GET/api/v1/users/unblock/:id
userRouter.get('/unblock/:id', isLogin, unBlockUser);

//GET/api/v1/users/admin-block/:id
userRouter.put('/admin-block/:id', isLogin, isAdmin, adminBlockUser);

//GET/api/v1/users/admin-block/:id
userRouter.put('/admin-unblock/:id', isLogin, isAdmin, adminUnBlockUser);

//PUT/api/v1/users/:id
userRouter.post('/profile-photo-upload', isLogin, upload.single('profile'), profilePhotoUpload);

//PUT/api/v1/users/:id
userRouter.put('/update-password', isLogin, updatePassword);

//PUT/api/v1/users/:id
userRouter.delete('/delete-account', isLogin, deleteUserAccount);


module.exports = userRouter;
