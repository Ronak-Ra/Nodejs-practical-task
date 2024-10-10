const { sendResponse } = require('../../middleware/headerValidator');
const moment = require('moment');
const { t } = require('localizify');

//Schema
const orderSchema = require('./Schema/order_schema');
const cartSchema = require('./Schema/cart_schema');
const paymentSchema = require('./Schema/payment_schema');
const orderItemSchema = require('./Schema/orderitem_schema');

let orderModel = {

    add_to_cart : async (req, res) => {

        try {

            let body = req.body;
            let { user_id } = req.loginUser;

            let cart_insert = {
                user_id: user_id,
                product_id: body.product_id,
                quantity: body.quantity
            }
            const newCart = new cartSchema(cart_insert);
            await newCart.save();
            return sendResponse(req, res, 200, 1, { keyword: "cart_added", components: {} });

        }catch (err) {
            
            return sendResponse(req, res, 200, 0, { keyword: "failed", components: {} });
        }
    },

    order_checkout : async (req, res) => {

        try {

            let body = req.body;
            let { user_id } = req.loginUser;

            let cart_data = await cartSchema.find({ user_id: user_id }).populate('product_id');
            
            if(cart_data.length == '0') throw new Error('cart_empty');

            let total_amount = 0;
            cart_data.forEach((element) => {
                total_amount += element.quantity * element.product_id.product_price;
            });

            let order_insert = {
                user_id: user_id,
                amount: total_amount,
                shipping_address: body.shipping_address,
                order_status: 'PENDING',
                shipping_date : moment().add(2, 'days').format('YYYY-MM-DD HH:mm:ss'),
                delivery_date : moment().add(5, 'days').format('YYYY-MM-DD HH:mm:ss')
            }
            const newOrder = new orderSchema(order_insert);
            await newOrder.save();

            cart_data.forEach(async (element) => {
                let order_item_insert = {
                    order_id: newOrder._id,
                    product_id: element.product_id,
                    quantity: element.quantity,
                    unit_price: element.product_id.product_price,
                    total_price: element.quantity * element.product_id.product_price
                }
                const newOrderItem = new orderItemSchema(order_item_insert);
                await newOrderItem.save();
            });

            let payment_insert = {
                order_id: newOrder._id,
                payment_method: body.payment_method,
                payment_status: 'PENDING',
                amount_paid: total_amount
            }

            const newPayment = new paymentSchema(payment_insert);
            await newPayment.save();
            await cartSchema.deleteMany({ user_id: user_id });

            return sendResponse(req, res, 200, 1, { keyword: "order_placed", components: {} }, { order_id: newOrder._id });

        }catch (err) {  
            
            let keyword = "failed";
            let components = {};
            if(err.message == 'cart_empty') keyword = "cart_empty";

            return sendResponse(req, res, 200, 0, { keyword: keyword, components: components });
        }
    },

    place_order : async (req, res) => {

        try {

            let body = req.body;
            let { user_id } = req.loginUser;

            let order_data = await orderSchema.findOne({ user_id: user_id, _id: body.order_id });
            let payment_data = await paymentSchema.findOne({ order_id: body.order_id });

            if(payment_data.payment_method != body.payment_method) throw new Error('check_payment_method');
            if(payment_data.payment_status == 'SUCCESS') throw new Error('payment_already_done');

            if(order_data) {

                if(body.payment_method == 'CARD') {
                    await paymentSchema.updateOne(
                        {order_id : body.order_id},
                        { $set : 
                            { 
                                payment_status: 'SUCCESS',
                                payment_details : body.card
                            } 
                        }
                    );
                }
                order_data.order_status = 'CONFIRM';
                await order_data.save();
                return sendResponse(req, res, 200, 1, { keyword: "order_placed", components: {} });

            } else {

                return sendResponse(req, res, 200, 0, { keyword: "order_not_found", components: {} });
            }

        }catch (err) {

            let keyword = "failed";
            let code = 0;

            if(err.message == 'check_payment_method') {

                keyword = "check_payment_method";

            } else if(err.message == 'payment_already_done') {
                    
                keyword = "payment_already_done";
            }

            return sendResponse(req, res, 200, code, { keyword: keyword, components: {} });
        }
    },

    get_order : async (req, res) => {

        try {
            
            let { user_id } = req.loginUser;
            let OrderData = await orderSchema.find({ user_id: user_id }).lean();

            // get order item for each order
            for (let i = 0; i < OrderData.length; i++) {
                let OrderItemData = await orderItemSchema.find({ order_id: OrderData[i]._id }).populate('product_id').lean();
                OrderData[i].OrderItem = OrderItemData;

                // change key name product_id to product
                OrderData[i].OrderItem.forEach((element) => {
                    element.product = element.product_id;
                    delete element.product_id;
                });
                
                // get payment for each order
                let PaymentData = await paymentSchema.findOne({ order_id: OrderData[i]._id });
                OrderData[i].Payment = PaymentData;
            }
            return sendResponse(req, res, 200, 1, { keyword: "order_list", components: {} }, OrderData);

        }catch (err) {
            
            return sendResponse(req, res, 200, 0, { keyword: "failed", components: {} });
        }
    },
};

module.exports = orderModel;