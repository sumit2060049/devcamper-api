const crypto=require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

//we'll  just go ahead and create our first method here , which is going to be to register a user.

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   public
exports.register= asyncHandler(async(req,res,next) => {
    
    const { name, email, password, role }=req.body;

    //Create user(here i didn't has the password here because later we will add a piece of middleware for that)
    const user=await User.create({
        name,
        email,
        password,
        role
    });
    //ultimately we want to send back a token but right now the goal , my goal is just to get the user registered, get the user in the database.
    //and encrypt the pwd and so on.

    // //Create token
    // const token=user.getSignedJwtToken();
    // res.status(200).json({success:true,token});

    sendTokenResponse(user,200,res);

});


//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   public
exports.login= asyncHandler(async(req,res,next) => {
    
    const { email, password }=req.body;

    //Validate email and password
    if(!email || !password){
        return next(new ErrorResponse('Please provide and email and password',400));
    }

    //Check for user
    const user=await User.findOne({email}).select('+password');//we do want the password included here because we need to obviously validate it for login.

    if(!user){
        return next(new ErrorResponse('Invalid credentials',401));
    }

    //check if password matched
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials',401));
    }

    //Create token
    // const token=user.getSignedJwtToken();
    // res.status(200).json({success:true,token});
    sendTokenResponse(user,200,res);

});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});



//@desc     Get current logged in user
//@route    POST /api/v1/auth/me
//@access   private
exports.getMe = asyncHandler(async(req,res,next)=>{
    const user= await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        data:user
    })
});


// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});


// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc     Forgot password
//@route    POST /api/v1/auth/forgotpassword
//@access   public
exports.forgotPassword = asyncHandler(async(req,res,next)=>{
    const user= await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorResponse('There is no user with that email',404));
    }

    //Get reset token
    const resetToken=user.getResetPasswordToken();

    //console.log(resetToken);
    //to save the user
    await user.save({validateBeforeSave:false});

      // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;


  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

    res.status(200).json({
        success:true,
        data:user
    })
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
  
    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }
  
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    sendTokenResponse(user, 200, res);
  });


//Get token from model, create cookie and send response
const sendTokenResponse = (user,statusCode,res) =>{
    //create token
    const token=user.getSignedJwtToken();
    
    const options={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true

    };

    if(process.env.NODE_ENV === 'production'){
        options.secure=true;
    }

    res
        .status(statusCode)
        .cookie('token',token,options)
        .json({
            success:true,
            token
        });
};