const express = require('express');
const { createComment, showComment, deleteComment, updateComment } = require('../../controllers/comments/commentController');
const isLogin = require('../../middlewares/isLogin');

const commentRouter = express.Router();


//POST/api/v1/comments
commentRouter.post('/:id', isLogin, createComment);

// GET/api/v1/comments/:id
commentRouter.get('/:id', showComment);

//DELETE/api/v1/comments/:id
commentRouter.delete('/:id', isLogin, deleteComment);

//PUT/api/v1/comments/:id
commentRouter.put('/:id', isLogin, updateComment);

module.exports = commentRouter;