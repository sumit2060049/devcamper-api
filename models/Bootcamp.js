//We need to creat a schema of fields

const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

//It take in an object with all the fields that we want along with validation and all that good stuff. 
const BootcampSchema = new mongoose.Schema({
//fields
    //name:String //if we do not need any validation.
    //but we want validation so want to make it an object.
    name:{
        type:String,
        required:[true,'Please add a name'],
        unique:true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    slug:String,//A slug is basically a URL friendly version of the name in this case. reason(5:27)
    description:{
        type:String,
        required:[true,'Please add a description'],
        maxlength:[500,'Description can not be more than 500 characters']
    },
    website: {
        type: String,
        //custom validation
        match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },//this is going to be the address that's ,that's sent to our server from the client.
    location: {
        // GeoJSON Point(type)
        type: {
        type: String,
        enum: ['Point']
        },
        coordinates: {
        type: [Number],
        index: '2dsphere'
        },
        //we can add other fields to this location if we want to or other parts of this location.
        //we're going to get a bunch of stuff from the MapQuest API The geocoder.
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
        ]
        //enum means these are the only available values.

    },
    averageRating: {//this isn't going to get inserted with a request.It is going to be generated
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
    type: String,
    default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
    //Later on we're going to have a user field bacause we need a user associated with the bootcamp 
    //so we know who added which bootcamp,

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//Adding a middleware

//create bootcamp slug from the name
BootcampSchema.pre('save',function(next){
//console.log('Slugify ran',this.name);//we can access any of the fields when we save a document/bootcamp 

//Now what i'd like to do is create the slug field.
this.slug = slugify(this.name,{lower:true});
next();
});

//Geocode & create location field
BootcampSchema.pre('save',async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location={
        type:'Point',
        coordinates:[loc[0].longitude,loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street:loc[0].streetName,
        city:loc[0].city,
        state:loc[0].stateCode,
        zipcode:loc[0].zipcode,
        country:loc[0].countryCode,
    }
    //Do not save address in DB
    this.address=undefined;
    next();
});

//cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('deleteOne', { document: true, query: false }, async function (next) {

    console.log(`Courses being removed from bootcamp ${this._id}`);
  
    await this.model('Course').deleteMany({ bootcamp: this._id });
  
    next()
});


//Rerverse populate with virtuals.
BootcampSchema.virtual('courses',{
    ref:'Course',
    localField:'_id',
    foreignField:'bootcamp',
    justOne:false
});

module.exports = mongoose.model('Bootcamp',BootcampSchema);//and now we should be able to use this model within our controllers to fetch data nd stuff like that.