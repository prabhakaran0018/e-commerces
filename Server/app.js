const express = require("express");
const app = express();
const bodyparser = require("body-parser")
const Productroute = require('./Routes/ProductRoute')
const Userroute = require('./Routes/UserRoute')
const Cartroute = require('./Routes/CartRoute')
const Orderroute = require('./Routes/OrderRoute')
const mongoose = require('mongoose');
const cors = require("cors");
app.use(bodyparser.json());
app.use(cors());


mongoose.connect(
    'mongodb+srv://prabhakarans2022cse:Prabha45@prabha.9ofmsu3.mongodb.net/e-commerce'
).then(() => {
    console.log('Connected to database!');
})
app.set('view engine','ejs'); //EMBEDDED JAVASCRIPT

app.use('/',Productroute)
app.use('/',Userroute)
app.use('/',Cartroute)
app.use('/',Orderroute)

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})