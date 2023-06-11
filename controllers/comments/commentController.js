const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr");


// Create comment 
const createComment = async (req, res, next) => {
    const { description } = req.body;
    try {
        // findt the post
        const post = await Post.findById(req.params.id);
        if (! post) {
            return next(appErr('Post not found', 404));
        }

        // Find the user
        const user = await User.findById(req.authId);
        if (! user) {
            return next(appErr('User not found', 404));
        }

        // create comment 
        const comment = await Comment.create({
            post: post._id,
            description,
            user: req.authId
        });

        // Push the comment to post
        post.comments.push(comment._id);
        await post.save({validateBeforeSave:false});

        res.json({
            status: 'success',
            data: comment
        })
    } catch (error) {
        next(appErr(error.message));
    }
}


const showComment = async (req, res) => {
    try {
        res.json({
            'status': 'success',
            data: "comment retrieved"
        })
    } catch (error) {
        res.json(error.message);
    }
}


const deleteComment = async (req, res) => {
    try {
        
        const comment = await Comment.findById(req.params.id);

        if ( comment.user.toString() !== req.authId.toString()) {
            return next(appErr('You are not allowed to delete this comment', 403))
        }

        await Comment.findByIdAndDelete(req.params.id);
       
        res.json({
            status: 'success',
            data: "Comment deleted"
        });
        
    } catch (error) {
         next(appErr(error.message));
    }
}

const updateComment = async (req, res, next) => {
    const { description } = req.body;
    try {
         
        const comment = await Comment.findById(req.params.id);
        if ( comment.user.toString() !== req.authId.toString()) {
            return next(appErr('You are not allowed to update this comment', 403))
        }

        const commentUpdate = await Comment.findByIdAndUpdate(
            req.params.id,
            { description },
            {
                new: true,
                runValidators:true
            }
        );
        return res.json({
            status: 'success',
            data: commentUpdate
        })
    } catch (error) {
        next(appErr(error.message));
    }
}

module.exports = {
    createComment,
    showComment,
    deleteComment,
    updateComment,
}