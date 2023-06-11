const User = require("../../model/User/User");
const Post = require("../../model/Post/Post");
const Category = require("../../model/Category/Category");
const Comment = require("../../model/Comment/Comment");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
// const getTokenFromHeader = require("../../utils/getTokenFromHeader");
const appErr = require("../../utils/appErr");



// Register user
const userRegister = async (req, res, next) => {
    console.log(6677);
    const { firstname, lastname, email, password } = req.body;
    
    try {


        const userFound = await User.findOne({ email: email });
        
        if (userFound) {
            return next(appErr('User already exist', 500));
        };

        // hash user password   
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create user 
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });

       return res.json({
            status: 'success',
            data: "User registered successfully"
        })
    } catch (error) {
        // next(appErr(error.message));
        next(error.message);
    }
}

// login user
const userLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        
        // check if email exist 
        const user = await User.findOne({ email });
        
        if (!user) {
            return next(appErr('Invalid login credentials', 401));
        }
        
        // verify password
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        
        if (!isPasswordMatched) {
            return next(appErr('Invalid login credentials', 401));

        }

        return res.json({
            status: 'success',
            data: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            }
        });

    } catch (error) {
        next(appErr(error.message));
    }
}

// who viewd my profile
const whoViewedMyProfile = async (req, res, next) => {

    try {
        // 1. fimd the original user 
        const user = await User.findById(req.params.id);
        // 2. find the user who viewd the original user 
        const userWhoViewed = await User.findById(req.authId);

        // 3. check if original and who viewd are found
        if (user && userWhoViewed) {
            // 4. check if userwhoviewd is already in the users viewers array
            const isUserAlreadyViewed = user.viewers.find(
                viewer => viewer.toString() === userWhoViewed._id.toString()
            );

            if (isUserAlreadyViewed) {
                return next(appErr('You already viewd this profile'));
            }   

             // 5. push the usserWhoViewed to the users viewers array 
            user.viewers.push(userWhoViewed._id);
            // 6. save the user
            await user.save();

            res.json({
                status: 'success',
                data: "You have succeefully viewd this profile"
            })
        } 
        
   
    } catch (error) {
        next(appErr(error.message));
    }
}


// following
const following = async (req, res, next) => {

    try {
        // 1. Find the user to follow 
        const userToFollow = await User.findById(req.params.id);
        // 2.  Find the user who is following 
        const userWhoFollowed = await User.findById(req.authId);
        
        // user should not be able to follow him self
        if (req.params.id === req.authId) {
            return next(appErr('You can not follow your self', 409));
        }

        // 3. check if userToFollow and userWhoFollowed are found 
        if (!userToFollow || !userWhoFollowed) {
            return next(appErr('User to follow or user who followed not found', 404));
        }

        // 4. check if userWhoFollowed is already in the users followers array 
        const isUserAlreadyFollowed = userToFollow.following.find(
            follower => follower.toString() === userWhoFollowed._id.toString()
        );

        if (isUserAlreadyFollowed) {
            return next(appErr('You already followed this user', 409));
        }

        // 5. Push userWhoFollowed into the the user's following array 
        userToFollow.followers.push(userWhoFollowed._id);
        // push usertofollow to the userWhoFollowed's following array
        userWhoFollowed.following.push(userToFollow._id);

        // save 
        await userWhoFollowed.save();
        await userToFollow.save();

        return res.json({
            status: 'success',
            data: "You have successfully followed this user"
        });
        
    } catch (error) {
        next(appErr(error.message));
    }
}


// following
const unfollow = async (req, res, next) => {
    try {
        // 1. Find the user to unfollow 
        const userToBeUnFollowed = await User.findById(req.params.id);
        // 2.  Find the user who is unfollowing 
        const userWhoUnFollowed = await User.findById(req.authId);

        // 3. check if userToBeUnFollowed and userWhoUnFollowed are found 
        if (!userToBeUnFollowed || !userWhoUnFollowed) {
            return next(appErr('User to unfollow or user who unfollowed not found', 404));
        }

        // 4. check if userWhoFollowed is already in the users followers array 
        const isUserAlreadyUnFollowed = userToBeUnFollowed.following.find(
            follower => follower.toString() === userWhoUnFollowed._id.toString()
        );
        
        if (! isUserAlreadyUnFollowed) {
            return next(appErr('You have not followed this user', 409));
        }

        // 5. Remove userWhoUnFollowed from the the user's followers array 
        userToBeUnFollowed.followers = userToBeUnFollowed.followers.filter(
            follower => follower.toString() !== userWhoUnFollowed._id.toString()
        );
        // save the userToBeUnFollowed
        await userToBeUnFollowed.save();

        // Remove userWhoUnFollowed from the the user's followers array 
        userWhoUnFollowed.following = userWhoUnFollowed.following.filter(
            following => following.toString() !== userToBeUnFollowed._id.toString()
        );
        // save the userWhoUnFollowed
        await userWhoUnFollowed.save();

        res.json({
            status: 'success',
            data: "You have successfully unfollowed this user"
        });
    } catch (error) {
        next(appErr(error.message));
    }
}

// block user
const blockUser = async (req, res, next) => {
    try {
        // 1. Find the user to be blocked 
        const userToBeBlocked = await User.findById(req.params.id);
        // 2.  Find the user who is blocking 
        const userWhoBlocked = await User.findById(req.authId);

        // 3. check if userToBeBlocked and userWhoBlocked are found 
        if (!userToBeBlocked || !userWhoBlocked) {
            return next(appErr('User to unfollow or user who unfollowed not found', 404));
        }

        // chcek if the user has already blocked the user 
        const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
            blocked => blocked.toString() === userToBeBlocked._id.toString()
        );
        
        if (isUserAlreadyBlocked) {
            return next(appErr('You already blocked this user', 409));
        }

        // push 
        userWhoBlocked.blocked.push(userToBeBlocked._id)
      
        await userWhoBlocked.save();

        res.json({
            status: 'success',
            data: "You have successfully blocked this user"
        });
    } catch (error) {
        next(appErr(error.message));
    }
}

// block user
const unBlockUser = async (req, res, next) => {
    try {
        // 1. Find the user to be blocked 
        const userToBeUnBlocked = await User.findById(req.params.id);
        // 2.  Find the user who is blocking 
        const userWhoUnBlocked = await User.findById(req.authId);

        // 3. check if userToBeBlocked and userWhoBlocked are found 
        if (!userToBeUnBlocked || !userWhoUnBlocked) {
            return next(appErr('User to unfollow or user who unfollowed not found', 404));
        }

        // chcek if the user has already blocked the user 
        const isUserAlreadyBlocked = userWhoUnBlocked.blocked.find(
            blocked => blocked.toString() === userToBeUnBlocked._id.toString()
        );
        
        if (! isUserAlreadyBlocked) {
            return next(appErr('This user has not been blocked', 409));
        }

        // remove the useTibeunblocked from the main user 
        userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
            blocked => blocked.toString() !== userToBeUnBlocked._id.toString()  
        );
      
        // save
        await userWhoUnBlocked.save();

        res.json({
            status: 'success',
            data: "You have successfully unblocked this user"
        });
    } catch (error) {
        next(appErr(error.message));
    }
}


// all users 
const allUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.json({
            status: 'success',
            data: users
        })
    } catch (error) {
        next(appErr(error.message));
    }
}

// Profile
const userProfile = async (req, res) => {

    try {
        
        const user = await User.findById(req.authId);

        if (!user) { 
            return next(appErr('User not found', 404));
        }

        return res.json({
            status: 'success',
            data: user
        });

    } catch (error) {
        next(appErr(error.message));
    }
}



const updateUser = async (req, res, next) => {

    const { email, lastname, firstname } = req.body;

    try {
        // check if email is not taken
        if (email) {
            const emailTaken = await User.findOne({ email });
            if (emailTaken) {
                return next(appErr('Email already taken', 409));
            }
        }

        // update the user
        const user = await User.findByIdAndUpdate(req.authId,
            {
                lastname,
                firstname,
                email
            },
            {
                new: true,
                runValidators: true
            }
        );
        return res.json({
            status: 'success',
            data: user
        })
    } catch (error) {
         next(appErr(error.message));
    }
}


const updatePassword = async (req, res, next) => {
    const { password } = req.body;
    try {

        if (!password) {
            return next(appErr('Password is required', 400));
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // update user
        const user = await User.findByIdAndUpdate(req.authId,
            {
                password: hashedPassword
            },
            {
                new: true,
                runValidators: true
            }
        );
        
        return res.json({
            status: 'success',
            data: "Password updated"
        })
    } catch (error) {
          next(appErr(error.message));
    }
}

// delete account
const deleteUserAccount = async (req, res, next) => {
   
    try {
        // fimd the user to be deleted 
        const userToDelete = await User.findById(req.authId);

        // find all post to delete
        await Post.deleteMany({ user: req.authId });
        await Comment.deleteMany({ user: req.authId });
        await Category.deleteMany({ user: req.authId });

        // delete the user 
        await userToDelete.delete();
        return res.json({
            status: 'success',
            data: "Account deleted"
        })
    } catch (error) {
        next(appErr(error.message));
    }
}


const adminBlockUser = async (req, res, next) => {
    try {

        const user = User.findById(req.params.id);
        if (! user) {
            return next(appErr('User not found', 404));
        }


        await User.findByIdAndUpdate(req.params.id, {
                $set: {
                    isBlocked: true,   
                }
            },
            {
                new: true,
            }
        );

        res.json({
            'status': 'success',
            data: "User blocked"
        })
    } catch (error) {
        next( appErr(error.message, 500));
    }
}


const adminUnBlockUser = async (req, res, next) => {
    try {

        const user = User.findById(req.params.id);
        if (! user) {
            return next(appErr('User not found', 404));
        }


        await User.findByIdAndUpdate(req.params.id, {
                $set: {
                    isBlocked: false,   
                }
            },
            {
                new: true,
            }
        );

        res.json({
            'status': 'success',
            data: "User unblocked"
        })
    } catch (error) {
        next( appErr(error.message, 500));
    }
}


const profilePhotoUpload = async (req, res, next) => {
    // console.log(req.file);
    try {

        //1. Fimd the user 
        const user = await User.findById(req.authId);
        //2. check if user is found
        if (!user) {
            return next(appErr('User not found', 404));
        }
        //3. Check if user is blocked
        if (user.isBlocked) {
            return next(appErr('Action not allowed, you account is blocked', 409));
        }
        //4 check if user is updating their photo
        if (req.file) {

            //5. Update profile photo
            await User.findByIdAndUpdate(req.authId, {
                    $set: {
                        profilePhoto: req.file.path,   
                    }
                },
                {
                    new: true,
                }
            );
            
            res.json({
                status: 'success',
                data: "Profile photo updated"
            });
        }
        

    } catch (error) {
        next( appErr(error.message, 500));
    }
}

module.exports = {
    userRegister,
    userLogin,
    allUsers,
    userProfile,
    updateUser,
    profilePhotoUpload,
    whoViewedMyProfile,
    following,
    unfollow,
    blockUser,
    unBlockUser,
    adminBlockUser,
    adminUnBlockUser,
    updatePassword,
    deleteUserAccount
};