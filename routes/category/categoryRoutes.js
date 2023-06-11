const express = require('express');
const { createCategory, showCategory, deleteCategory, allCategories, updateCategory } = require('../../controllers/categories/categoryController');
const isLogin = require('../../middlewares/isLogin');
 
const categoryRouter = express.Router();


//POST/api/v1/categories
categoryRouter.post('/', isLogin, createCategory);

//GET/api/v1/categories
categoryRouter.get('/', isLogin, allCategories);

// GET/api/v1/categories/:id
categoryRouter.get('/:id', showCategory);

//DELETE/api/v1/categories/:id
categoryRouter.delete('/:id', isLogin, deleteCategory);

//PUT/api/v1/categories/:id
categoryRouter.put('/:id', isLogin, updateCategory);


module.exports = categoryRouter;