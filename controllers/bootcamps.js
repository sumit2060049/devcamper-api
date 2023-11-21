const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder=require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');//we're going to bring in the model.
//So now we have this bootcamp object from our model that we can call methods on like create and find and all that stuff.

//Here we're going to create different methods that are going to be associated with certain routes.
//we need to export each method so that we can basically bring it into the routes file.
//These are basically middleware function


//@desc     GET all bootcamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getBootcamps = asyncHandler(async (req,res,next) => {

    res.status(200).json(res.advancedResults);

    // let query;

    // //copy req.query
    // const reqQuery={...req.query};

    // //Fields to exclude
    // const removeFields=['select','sort','page','limit'];

    // //Loop over removeFields and delete them from reqQuery
    // removeFields.forEach(param => delete reqQuery[param]);

    // //console.log(reqQuery);

    // //create query string
    // let queryStr=JSON.stringify(reqQuery);

    // // let queryStr=JSON.stringify(req.query);
    // //create operators($gt,$gte,etc)
    // queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match => `$${match}`);

    // //Finding resource
    // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // //console.log(queryStr);
    // //select Fields
    // if(req.query.select){
    //     const fields = req.query.select.split(',').join(' ');
    //     //console.log(fields);
    //     query=query.select(fields);
    // }

    // //sort
    // if(req.query.sort){
    //     const sortBy=req.query.sort.split(',').join('');
    //     query = query.sort(sortBy);
    // }else{
    //     query=query.sort('-createdAt');
    // }

    // //pagination
    // const page=parseInt(req.query.page,10)||1;
    // const limit=parseInt(req.query.limit,10)||25;
    // const startIndex=(page-1)*limit;
    // const endIndex=page*limit;
    // //Mthod to count all the documents
    // const total=await Bootcamp.countDocuments();

    // query=query.skip(startIndex).limit(limit);
    // //try {

    //     //console.log(req.query);//it give us the object in our url(query params).
    // //const bootcamps = await Bootcamp.find();

    // //Executing query
    // const bootcamps=await query;

    // //pagination results
    // const pagination={};

    // if(endIndex<total){
    //     pagination.next={
    //         page:page+1,
    //         limit
    //     }
    // }
    // if(startIndex>0){
    //     pagination.prev={
    //         page:page-1,
    //         limit
    //     }
    // }

        //const bootcamps = await Bootcamp.find(req.query);

       // res.status(200).json({success:true,count: bootcamps.length,pagination:pagination,data:bootcamps});
    //} catch (err) {
        //res.status(400).json({success:false});
       // next(err);
    //}
    
    
    // res.status(200).json({success:true,msg:'Show all bootcamps'});
});

//@desc     GET single bootcamps
//@route    GET /api/v1/bootcamps/:id
//@access   public
exports.getBootcamp = asyncHandler( async (req,res,next) => {
    //try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            //if id is not found in database.
            //return res.status(400).json({success:false});
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        res.status(200).json({success:true,data:bootcamp});

    //} catch (err) {
        //not formatted
        //res.status(400).json({success:false});
        //next(err);//instead of just passing in error like this, we want to actually create a new error response object wit a message and a status code.
        //next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));

    //}

    //res.status(200).json({success:true,msg:`Show bootcamp ${req.params.id}`});
});

//@desc     Create new bootcamps
//@route    POST /api/v1/bootcamps
//@access   private
exports.createBootcamp = asyncHandler( async (req,res,next) => {
    //console.log(req.body);//in order to use req.body,you have to add a piece of middleware that's included with express so you have to use it.
    //res.status(200).json({success:true,msg:'Create new bootcamp'});

    //try {
        //Add user to req.body
        req.body.user=req.user.id;

        //check for published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({user:req.user.id});

        //If the user is not an admin,they can only add one bootcamp
        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(new ErrorResponse(`Ther user with ID ${req.user.id} has already published a bootcamp`,400));
        }



        const bootcamp = await Bootcamp.create(req.body);//this gives us a promise,just like every mongoose method.



        res.status(201).json({
            success:true,
            data:bootcamp
        });
    // } catch (err) {
    //     //res.status(400).json({success : false});
    //     next(err);
    // }
});

//@desc     Update bootcamps
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.updateBootcamp = asyncHandler( async (req,res,next) => {

    //try {
        let bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        //Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,401));
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,//because when we get our response we want to get updated data
            runValidators:true//to run mongoose validator
        });

        res.status(200).json({success:true,data:bootcamp});
    // } catch (err) {
    //     //res.status(400).json({success:false});
    //     next(err);
    // }


    //res.status(200).json({success:true,msg:`Update bootcamp ${req.params.id}`});
});

//@desc     Delete bootcamps
//@route    DELETE /api/v1/bootcamps/:id
//@access   private
exports.deleteBootcamp = asyncHandler( async (req,res,next) => {
    //try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        //Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`,401));
        }

        bootcamp.deleteOne();

        res.status(200).json({success:true,data:{}});
    // } catch (err) {
    //     //res.status(400).json({success:false});
    //     next(err);
    // }

    //res.status(200).json({success:true,msg:`Delete bootcamp ${req.params.id}`});
});

//@desc     Get bootcamps within a radius
//@route    DELETE /api/v1/bootcamps/radius/:zipcode/:distance
//@access   private
exports.getBootcampInRadius = asyncHandler( async (req,res,next) => {
    const {zipcode,distance} = req.params;//coming from url

    //Get lat/lng from geocoder,
    //we are basically doing the same thing we did in that piece of middleware where we did the geocoding.
    const loc=await geocoder.geocode(zipcode);
    const lat=loc[0].latitude;
    const lng=loc[0].longitude;

    //cacl radius using radians
    //divide dist by radius of earth(3963(mi)/6378 km)
    const radius=distance/3963;

    const bootcamps=await Bootcamp.find({
        location:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
    });
    
    res.status(200).json({
        success:true,
        count:bootcamps.length,
        data:bootcamps
    });

});


//@desc     Upload photo for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   private
exports.bootcampPhotoUpload = asyncHandler( async (req,res,next) => {
    //try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        //Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,401));
        }
        
        //Now we're going to check to see if a file was actually uploaded.
        if(!req.files){
            return next(new ErrorResponse(`Please upload a file`,400));
        }
        
        //console.log(req.files);
        //console.log(req.files.file);

        const file=req.files.file;

        //Little bit of validation
        //Make sure the image is a photo
        if(!file.mimetype.startsWith('image')){
            return next(new ErrorResponse(`Please upload an image file`,400));
        }

        //Check filesize
        if(file.size>process.env.MAX_FILE_UPLOAD){
            return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400));
        }

        //Create custom filename
        file.name=`photo_${bootcamp._id}${path.parse(file.name).ext}`;
        console.log(file.name)


        //so now it's time to actually upload the file
        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err => {
            if(err){
                console.log(err);
                return next(new ErrorResponse(`Problem with file upload`,500));
            }

            await Bootcamp.findByIdAndUpdate(req.params.id,{photo:file.name});

            res.status(200).json({
                success:true,
                data:file.name
            });

        });

    // } catch (err) {
    //     //res.status(400).json({success:false});
    //     next(err);
    // }

    //res.status(200).json({success:true,msg:`Delete bootcamp ${req.params.id}`});
});