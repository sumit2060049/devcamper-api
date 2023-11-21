const path=require('path');
const express = require('express');
const dotenv = require('dotenv');
//const logger = require('./middleware/logger');
const morgan= require('morgan');
const colors = require('colors');
const fileupload= require('express-fileupload');
const cookieParser= require('cookie-parser');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const xss=require('xss-clean');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');
const cors=require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');


//load config file or env var(in order to use those variable)

dotenv.config({path:'./config/config.env'});

//connect to database

connectDB();

//Route files

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app=express();

//Body parser
app.use(express.json());//in order to use req.body 



//to use middleware
//app.use(logger);


//cookie parser
app.use(cookieParser());

//Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));//different parameter in morgan will print different things.  
}

//Add the line for the middleware
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent cross-site scripting attack
app.use(xss());

//Rate limiting
const limiter=rateLimit({
    windowMs:10*60*1000,//10min
    max:100
});

app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname,'public')));

//Now we have to mount the router onto a specific URL.
//Mount routers
app.use('/api/v1/bootcamps',bootcamps);//connect this to that bootcamps file that we just brought in.
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

//Handled unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.message}`.red);
    //close server and exit process
    server.close(() => process.exit(1));
})

