const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const aqiModel = require('./models/aqi_inModel');
const ejs = require('ejs');
// const dotenv = require('dotenv').config();
// const {MONGODB_URI} = process.env;

// const route = require('./route/route');
const mongoose = require('mongoose');

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://chaudharyaditya41:Z67gI1uJnrGCnHuY@cluster0.jgngtnq.mongodb.net/testingAPIsDb5?retryWrites=true&w=majority', {
    usenewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB is connected"))
    .catch(err => console.log(err))


// app.use('/', route);

// app.get('/',(req,res)=>{
//     res.send("Working")
// })

app.get('/', async (req,res)=>{
    console.log("hello");
    const documents = await aqiModel.find();
    console.log(documents);
    res.render('index',{documents});
})

app.listen(process.env.PORT || 4000, function () {
    console.log('Express app running on Port', (process.env.PORT || 4000))
});