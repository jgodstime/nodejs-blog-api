const User = require("../../model/User/User");
const Post = require("../../model/Post/Post");
const appErr = require("../../utils/appErr");



// create post 
const createPost = async (req, res, next) => {

    const { title, description, category} = req.body;

    try {
        // find the user
        const user = await User.findById(req.authId); 

        // check if the user is blocked 
        if (user.isBlocked) {
            return next(appErr('Access denied, account blocked', 403));
        }
        
        if (user.isBlocked) {
            return next(appErr("User is blocked", 403));
        }
        // console.log(user._id);
        // create the post
        const post = await Post.create({
            title,
            description,
            user: user._id,
            category,
            // photo: req?.file?.path
        });
      
        // Assoclate user to a post - push the post into the the user posts field
        // user.posts.push(post)
       
        // save post
        // await user.save();
        
        return res.json({
            status: 'success',
            data: post
        })
    } catch (error) {
        next(appErr(error.message));
    }
}


const fetchPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({}).populate('user').populate('category', ['title']);
        
        // check if user is blocked by the post owner
        const filteredPosts = posts.filter(post => {
            // get blocked users 
            const blockedUsers = post.user.blocked;
            const isBlocked = blockedUsers.includes(req.authId);
            // return isBlocked ? null : post;
            return !isBlocked;
        });
        
        res.json({
            'status': 'success',
            data: filteredPosts
        })
    } catch (error) {
        next(appErr(error.message));
    }
}


const showPost = async (req, res, next) => {
   
    try {
       
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(appErr("Post not found", 404));
        }

        // check if user has viewed
        const isViewd = post.numViews.includes(req.authId);

        if (! isViewd) {
            post.numViews.push(req.authId); 
            await  post.save();
        }

        res.json({
            status: 'success',
            data: post
        });

    } catch (error) {
        next(appErr(error.message));
    }
}

const toggleLikesPost = async (req, res, next) => {
   
    try {

        console.log(33)
        const post = await Post.findById(req.params.id);
       
        if (!post) {
            return next(appErr("Post not found", 404));
        }

        // check if the user has already liked the post
        const isLiked = post.likes.includes(req.authId)

        // if the user has already like the post, unlike the post
        if (isLiked) {
            post.likes = post.likes.filter(like => like.toString() !== req.authId.toString());
            await post.save();
        } else {
            post.likes.push(req.authId);
            await post.save();
        }

        res.json({
            'status': 'success',
            data: "You have successfully liked the post"
        })

    } catch (error) {
        next(appErr(error.message));
    }
}

const toggleDisLikesPost = async (req, res, next) => {
   
    try {

        const post = await Post.findById(req.params.id);
       
        if (!post) {
            return next(appErr("Post not found", 404));
        }

        // check if the user has already disliked the post
        const isDisLiked = post.dislikes.includes(req.authId)

        // if the user has already dislike the post, unlike the post
        if (isDisLiked) {
            post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== req.authId.toString());
            await post.save();
        } else {
            post.dislikes.push(req.authId);
            await post.save();
        }

        res.json({
            'status': 'success',
            data: post
        })

    } catch (error) {
        next(appErr(error.message));
    }
}

const allPosts = async (req, res) => {
    try {
        res.json({
            'status': 'success',
            data: "Posts"
        })
    } catch (error) {
        res.json(error.message);
    }
}

const deletePost = async (req, res, next) => {
    
    try {
        
    const post = await Post.findById(req.params.id);

    if ( post.user.toString() !== req.authId.toString()) {
        return next(appErr('You are not allowed to delete this post', 403))
    }

        await Post.findByIdAndDelete(req.params.id);
       
        res.json({
            status: 'success',
            data: "Post deleted"
        });
        
    } catch (error) {
         next(appErr(error.message));
    }
}


const updatePost = async (req, res, next) => {
    const { title, description, category } = req.body; 
    try {
        
        const post = await Post.findById(req.params.id);

        if ( post.user.toString() !== req.authId.toString()) {
            // return next(appErr('You are not allowed to update this post', 403))
        }
        console.log(title);
        await Post.findByIdAndUpdate(req.params.id,
            {
                title,
                description,
                category,
            },
            {
                new: true,
            }
        );
       
        res.json({
            status: 'success',
            data: "Post updated"
        });
        
    } catch (error) {
         next(appErr(error.message));
    }
}

module.exports = {
    createPost,
    showPost,
    allPosts,
    deletePost,
    updatePost,
    fetchPosts,
    toggleLikesPost,
    toggleDisLikesPost
};