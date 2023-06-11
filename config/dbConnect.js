const mongoose = require('mongoose')

// function to connect 

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Db has connected successfully')
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

// export the function 
dbConnect();