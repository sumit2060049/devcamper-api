const express = require('express');
const dotenv = require('dotenv');
const e = require('express');

//load config file or env var(in order to use those variable)

dotenv.config({path:'./config/config.env'});

const app=express();


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));


