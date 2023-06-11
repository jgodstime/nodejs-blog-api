const appErr = require("../../utils/appErr");
const Category = require("../../model/Category/Category");


// create category
const createCategory = async (req, res, next) => {
    const { title } = req.body;

    try {

        const category = await Category.create({
            title,
            user: req.authId,
        });

        return res.json({
            status: 'success',
            data: category
        })

    } catch (error) {
        next( appErr(error.message, 500));
    }
}

const allCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        return res.json({
            status: 'success',
            data: categories
        })
    } catch (error) {
       next( appErr(error.message, 500));
    }
}

const showCategory = async (req, res) => {

    try {
        const category = await Category.findById(req.params.id);
        return res.json({
            status: 'success',
            data: category
        })
    } catch (error) {
        next( appErr(error.message, 500));
    }
}

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        
        return res.json({
            status: 'success',
            data: 'Deleted'
        })
    } catch (error) {
        res.json(error.message);
    }
}

const updateCategory = async (req, res) => {
    const { title } = req.body;
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { title },
            {
                new: true,
                runValidators:true
            }
        );
        return res.json({
            status: 'success',
            data: category
        })
    } catch (error) {
        res.json(error.message);
    }
}

module.exports = {
    createCategory,
    showCategory,
    deleteCategory,
    updateCategory,
    allCategories
    
}