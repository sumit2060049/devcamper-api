//@desc     Logs request to console
//so any request we make this function is going to run now since we created a variable on this request object we have access to this within our routes.
const logger = (req,res,next) => {
    //set a value on the request object so that we can then access in any routes that come after this middleware.
    //req.hello = 'Hello world';
    //console.log('Middleware ran');
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
}

module.exports = logger;