const express = require('express');
const globalErrHandler = require('./middlewares/globalErrHandler');
const isAdmin = require('./middlewares/isAdmin');
const categoryRouter = require('./routes/category/categoryRoutes');
const commentRouter = require('./routes/comments/commentRoutes');
const postRouter = require('./routes/posts/postRoutes');
const userRouter = require('./routes/users/userRoutes');

require("dotenv").config();
require("./config/dbConnect");
const app = express();


// app.use(isAdmin);

// middlerwares 
app.use(express.json()); //pass incoming payload
const userAuth = {
    isLogin: true,
    isAdmin: false
};

app.use((req, res, next) => {
    if (userAuth.isLogin) {
        next();
    } else {
        return res.json({
            msg: "Invalid login credentilas"
        })
    }
});



// Routes 
// Users routes 
app.use('/api/v1/users/', userRouter); 

// POST Routes
app.use('/api/v1/posts/', postRouter);

// Comment Routes 
app.use('/api/v1/comments/', commentRouter);

// Categories Routes 
app.use('/api/v1/categories/', categoryRouter);

// error handlers middlerware
app.use(globalErrHandler);

// 404 error
app.use('*', (req, res) => {
    res.status(404).json({
        message: `${req.originalUrl} - Route not found`
    });
});

// listen to server


const PORT = process.env.PORT || 9000;

app.listen(PORT, console.log(`Server port is running on ${PORT}`));