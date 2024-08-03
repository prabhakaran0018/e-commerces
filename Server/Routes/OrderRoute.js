const express = require('express');
const Router = express.Router();
const OrderController = require('../Controllers/OrderController');
const auth = require("../Middleware/Auth")

Router.post('/addorder',auth, OrderController.orderdetails);
Router.get('/getorder',auth, OrderController.getorder);

module.exports = Router;