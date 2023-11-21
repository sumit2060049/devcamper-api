const { populate } = require("../models/Course");

const advancedResults = (model,populate) => async (req,res,next) => {
    let query;

    //copy req.query
    const reqQuery={...req.query};

    //Fields to exclude
    const removeFields=['select','sort','page','limit'];

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    //console.log(reqQuery);

    //create query string
    let queryStr=JSON.stringify(reqQuery);

    // let queryStr=JSON.stringify(req.query);
    //create operators($gt,$gte,etc)
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match => `$${match}`);

    //Finding resource
    query = model.find(JSON.parse(queryStr));

    //console.log(queryStr);
    //select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        //console.log(fields);
        query=query.select(fields);
    }

    //sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join('');
        query = query.sort(sortBy);
    }else{
        query=query.sort('-createdAt');
    }

    //pagination
    const page=parseInt(req.query.page,10)||1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    //Mthod to count all the documents
    const total=await model.countDocuments();

    query=query.skip(startIndex).limit(limit);
    //try {

        //console.log(req.query);//it give us the object in our url(query params).
    //const bootcamps = await Bootcamp.find();

    if(populate){
        query=query.populate(populate);
    }

    //Executing query
    const results=await query;

    //pagination results
    const pagination={};

    if(endIndex<total){
        pagination.next={
            page:page+1,
            limit
        }
    }
    if(startIndex>0){
        pagination.prev={
            page:page-1,
            limit
        }
    }

    res.advancedResults ={
        success:true,
        count:results.length,
        pagination,
        data:results
    }
    next();
};

module.exports=advancedResults;