const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User=require('../models/User');//because we need to look up the user by the ID that's in the token.

//protect routes
exports.protect = asyncHandler(async(req,res,next) => {
    let token;

    //Now we want to check for header check for that authorization
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        //set token from bearer token in header
        token= req.headers.authorization.split(' ')[1];
    }
        //set token from cookie
    // else if(req.cookies.token){
    //     token=req.cookies.token
    // }

    //Make sure token exists
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route',401));
    } 

    try {
        //Verify token(extract payload from it)
        const decoded= jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);//it contains value for user id

        req.user = await User.findById(decoded.id);//here we got the user and we put it into req.user.
        //so in any route where we use that middleware,we have access to request dot user.(in any other user field )


        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route',401));
    }
})

//Grant access to specific roles
exports.authorize = (...roles) =>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is nog authorized to access this route`,403));
        }
        next();
    }
}
