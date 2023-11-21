const mongoose = require('mongoose');

//we are going to create a function here that we can export and then we can just simply call it within our Server.js.

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);

};

module.exports = connectDB;

