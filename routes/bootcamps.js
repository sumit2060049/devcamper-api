const express = require('express');

const {getBootcamps,getBootcamp,createBootcamp,updateBootcamp,deleteBootcamp,getBootcampInRadius,bootcampPhotoUpload} = require('../controllers/bootcamps');

const Bootcamp=require('../models/Bootcamp');

//Including other resource routers
const courseRouter=require('./courses');
const reviewRouter=require('./reviews');

const router = express.Router();

const advancedResults= require('../middleware/advancedResults');
const {protect,authorize}=require('../middleware/auth');

//Re-route into other resource routers
router.use('/:bootcampId/courses',courseRouter);
router.use('/:bootcampId/reviews',reviewRouter);



// router.get('/',(req,res) => {
//     //res.send('<h1>Hello from express</h1>');//used to send data back.
//     //res.send({name:'Brad'})//it is just a js object we don't have to do json.stringify();
//     //res.json({name:'Brad'});//when you send back json you can also use res.json();
//     //res.sendStatus(400);//only status
//     //res.status(400).json({success:false});
//     //res.status(200).json({success:true,data:{id:1}});
//     res.status(200).json({success:true,msg:'Show all bootcamps'});

// });
// router.get('/:id',(req,res) => {
//     res.status(200).json({success:true,msg:`Show bootcamp ${req.params.id}`});

// });

// router.post('/',(req,res) => {
//     res.status(200).json({success:true,msg:'Create new bootcamp'});

// });

// router.put('/:id',(req,res) => {
//     res.status(200).json({success:true,msg:`Update bootcamp ${req.params.id}`});

// });

// router.delete('/:id',(req,res) => {
//     res.status(200).json({success:true,msg:`Delete bootcamp ${req.params.id}`});

// });

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload);

router.route('/').get(advancedResults(Bootcamp,'courses'), getBootcamps).post(protect,authorize('publisher','admin'),createBootcamp);

router.route('/:id').get(getBootcamp).put(protect,authorize('publisher','admin'),updateBootcamp).delete(protect,authorize('publisher','admin'),deleteBootcamp);

module.exports = router;