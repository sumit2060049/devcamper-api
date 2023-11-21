const ErrorResponse = require("../utils/errorResponse");

//custom error handler
const errorHandler=(err,req,res,next) => {
    let error={...err};//copy of error variable

    error.message=err.message;
    //log to console for dev
    console.log(err.stack.red);//the error object has a stack on it which will give us like the error and all the file info and stuff like that.

    //res.status(err.statusCode || 500).json({
    //    success:false,
    //    error:err.message || 'Server Error'
    //});

    console.log(err);

    //Mongoose bad ObjectId
    //console.log(err.name);
    if(err.name === 'CastError'){
        const message =`Resource not found`;
        error = new ErrorResponse(message,404);
    }

    //Mongoose duplicate kay
    if(err.code === 11000){
        const message='duplicate field value entered';
        error = new ErrorResponse(message,400);
    }
    
    //Mongoose validation error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error=new ErrorResponse(message,400);
    }


    res.status(error.statusCode || 500).json({
        success:false,
        error:error.message || 'Server Error'
    });
};

module.exports = errorHandler;

//since this is middleware,we need to run it throught app.use in order to use it.