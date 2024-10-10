const express = require('express');
const router = express.Router();
const {checkToken, checkApiKey, validateJoi} = require('../../middleware/headerValidator');
const Joi = require('joi');

//models
const authModel = require('../../models/v1/auth.model');
const orderModel = require('../../models/v1/order.model');
const productModel = require('../../models/v1/product.model');

//--------------------------AUTHENTICATION-------------------//
router.post("/auth/create_account",checkApiKey,validateJoi(

    Joi.object({
        full_name: Joi.string().required(),
        email: Joi.string().allow(''),
        country_code: Joi.string().allow(''),
        mobile_number: Joi.number().allow(''),
        password: Joi.string().when('login_type', {
            is: 'S',
            then: Joi.required()
        }),
        login_type: Joi.string().required().valid('S', 'G', 'A'),
        social_id: Joi.string().when('login_type', {
            is: Joi.string().valid('G', 'I', 'A'),
            then: Joi.required()
        }),
        time_zone: Joi.string().required(),
        device_token: Joi.string().required(),
        device_type: Joi.string().required().valid('A', 'I', 'W'),
        device_name: Joi.string().allow(''),
        uuid: Joi.string().allow(''),
        model_name: Joi.string().allow(''),
        os_version: Joi.string().allow(''),
        ip: Joi.string().allow('')
    }).or('email', 'country_code', 'mobile_number')
), authModel.create_account);

router.post("/auth/login", checkApiKey, validateJoi(

    Joi.object({
        email: Joi.string().allow(''),
        country_code: Joi.string().allow(''),
        mobile_number: Joi.string().allow(''),
        password: Joi.string().when('login_type', {
            is: 'S',
            then: Joi.required()
        }),
        login_type: Joi.string().required().valid('S', 'G', 'I', 'A'),
        social_id: Joi.string().when('login_type', {
            is: Joi.string().valid('G', 'I', 'A'),
            then: Joi.required()
        }),
        device_token: Joi.string().required(),
        device_type: Joi.string().required().valid('A', 'I'),
        device_name: Joi.string().allow(''),
        uuid: Joi.string().allow(''),
        model_name: Joi.string().allow(''),
        os_version: Joi.string().allow(''),
        ip: Joi.string().allow(''),
        time_zone: Joi.string().required()
    }).or('email', 'country_code', 'mobile_number')
), authModel.sign_in);

router.get("/auth/logout", checkApiKey, checkToken, authModel.logout);

//----------------------PRODUCT-------------------------//

router.post("/product/add_product", checkApiKey, validateJoi(
    Joi.object({
        product_name: Joi.string().required(),
        product_description: Joi.string().required(),
        product_price: Joi.number().required()
    })
), productModel.add_product);

router.get("/product/get_product", checkApiKey, productModel.get_product);

//------------------------ORDER-------------------------//

router.post("/order/add_to_cart", checkApiKey, checkToken, validateJoi(
    Joi.object({
        product_id: Joi.string().required(),
        quantity: Joi.number().required()
    })
), orderModel.add_to_cart);

router.post("/order/order_checkout", checkApiKey,checkToken,validateJoi(
    Joi.object({
        shipping_address : Joi.string().required(),
        payment_method : Joi.string().required().valid('COD', 'CARD')
    })
),orderModel.order_checkout);

router.post("/order/place_order", checkApiKey, checkToken, validateJoi(
    Joi.object({
        order_id: Joi.string().required(),
        payment_method: Joi.string().required().valid('COD', 'CARD'),
        card: Joi.when('payment_method', {
            is: 'CARD',
            then: Joi.object({
                card_number: Joi.string().required(),
                card_holder_name: Joi.string().required(),
                expiry_month: Joi.string().required(),
                expiry_year: Joi.string().required(),
                cvv: Joi.string().required()
            }).required(),
            otherwise: Joi.forbidden()
        })
    })
), orderModel.place_order);

router.get("/order/get_order", checkApiKey, checkToken, orderModel.get_order);

module.exports = router;