const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add a name']
    },
    email: {
        type: String,
        required:[true,'Please add an email'],
        unique:true,
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
        ]
    },
    role:{
        type:String,
        enum:['user','publisher'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please add a password'],
        minlength:6,
        select:false//what it will do is when we get a user through our API,it's not going to actually show the password,it's not going to return the password.
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,//we also want an expiration,So let's say reset password expire and that's actually going to be a date.
    createdAt:{
        type:Date,
        default:Date.now
    },
});

//Encrypt password using bcrypt
UserSchema.pre('save',async function(next){
//and we need to generate a salt to use that to actually hash the password
//And when we call gen salt,which is a method on the Bcrypt object,it returns a promise.

    if(!this.isModified('password')){
        next();
    }

    const salt=await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    });
};

//Match user entered password to hashed password in database(in order to do that we will use bcrypt there is a method called compare which will do that)
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function(){
    //Generate token
    const resetToken=crypto.randomBytes(20).toString('hex');

    //Hash token and set to resetpasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Set expire
    this.resetPasswordExpire=Date.now()+10*60*1000;
    
    return resetToken;
}



module.exports = mongoose.model('User',UserSchema);

//now let's create our route file for we're going to create auth.