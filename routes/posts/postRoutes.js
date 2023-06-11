const express = require('express');
const storage = require('../../config/cloudinary')
const isLogin = require('../../middlewares/isLogin');
const { createPost, showPost, allPosts, deletePost, updatePost, fetchPosts, toggleLikesPost, toggleDisLikesPost } = require('../../controllers/posts/postController');
// const multer = require('multer');
const postRouter = express.Router();

// file upload middleware
// const upload = multer({ storage });

//POST/api/v1/posts
// postRouter.post('/', isLogin, upload.single("image"), createPost);
postRouter.post('/', isLogin, createPost);

// GET/api/v1/posts/:id
postRouter.get('/:id', isLogin, showPost);

// POST/api/v1/posts/likes/:id
postRouter.post('/likes/:id', isLogin, toggleLikesPost);

// POST/api/v1/posts/likes/:id
postRouter.post('/dislikes/:id', isLogin, toggleDisLikesPost);

//GET/api/v1/posts
postRouter.get('/', isLogin, fetchPosts);


//DELETE/api/v1/posts/:id
postRouter.delete('/:id', isLogin, deletePost);

//PUT/api/v1/posts/:id
postRouter.put('/:id',isLogin, updatePost);

module.exports = postRouter;