const OrderModel = require('../Models/OrderModel');
const ProductModel = require('../Models/ProductModel');
const CartModel = require('../Models/CartModel');
const UserModel = require('../Models/UserModel');
// const ProductModel = require('../Models/ProductModel');
const CartService = require("../Services/CartService")

const orderdetails = async (req, res) => {
    const user_id = req.user.id;
    // console.log(user_id);
    
    try {
      const user = await UserModel.findOne({ _id: user_id });
      // console.log(user);
      
      if (!user) {
        return res.status(400).json({ status: "failure", message: "User not found" });
      }
  
      const cartResult = await CartService.getproduct(user_id);
      // if (!cartResult || !cartResult.productDetails || !cartResult.subtotal) {
      //   return res.status(400).json({ status: "failure", message: "Failed to retrieve cart details or cart is empty." });
      // }
      const { productDetails, subtotal } = cartResult;
  
      if (productDetails.length === 0) {
        return res.status(400).json({ status: "failure", message: "No products in the cart." });
      }
  
      const order = new OrderModel({
        cust_name: req.body.cust_name,
        cust_phone: req.body.cust_phone,
        cust_address: req.body.cust_address,
        order_date: new Date(),
        delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days after the order date
        order_items: productDetails,
        total_amount: subtotal,
        order_status: req.body.order_status,
        user_id: user_id
      });
  
      await order.save();
      await CartModel.deleteOne({user_id});
      res.status(200).json({ status: "success", message: "Order placed successfully", order });
    } catch (err) {
      // console.error(err);
      res.status(500).json({ status: "failure", message: err.message });
    }
  };



//   
const getorder = async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await OrderModel.find({ user_id: userId });
  
      if (orders.length === 0) {
        return res.status(404).json({ message: "Orders not found" });
      }
  
      const orderDetails = await Promise.all(orders.map(async (ord) => {
        let subtotal = 0;
        const products = [];
  
        if (!ord.products) {
          console.error("No products found in order:", ord._id);
          return null;
        }
  
        let orderProducts;
        try {
          orderProducts = JSON.parse(ord.products);
        } catch (error) {
          console.error("Error parsing products JSON:", error);
          return null;
        }
  
        const productPromises = orderProducts.map(async (prod) => {
          try {
            const product = await ProductModel.findOne({ id: prod.product_id });
            if (!product) {
              console.log(`Product with ID ${prod.product_id} not found`);
              return null;
            }
  
            const productTotal = product.price * prod.quantity;
            subtotal += productTotal;
            return {
              product_title: product.title,
              product_price: product.price,
              product_image: product.image,
              product_desc: product.description,
              product_quantity: prod.quantity,
            };
          } catch (error) {
            console.error(`Error fetching product with ID ${prod.product_id}:`, error);
            return null;
          }
        });
  
        const resolvedProducts = await Promise.all(productPromises);
        resolvedProducts.forEach((product) => {
          if (product) products.push(product);
        });
  
        return {
          order_id: ord._id,
          products,
          order_date: ord.orderdate,
          est_date: ord.deliverydate,
          subtotal,
          order_status: ord.orderstatus,
        };
      }));
  
      res.json(orderDetails.filter(order => order !== null));
    } catch (error) {
      console.error("Error fetching orders:", error.message || error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  };
  

module.exports = {orderdetails,getorder};