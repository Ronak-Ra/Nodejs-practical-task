const { sendResponse } = require('../../middleware/headerValidator');

//schema
const productSchema = require('./Schema/product_schema');

let productModel = {

    add_product : async (req, res) => {

        try {

            let body = req.body;

            let product_insert = {
                product_name: body.product_name,
                product_description: body.product_description,
                product_price: body.product_price
            }
            const newProduct = new productSchema(product_insert);
            await newProduct.save();
            return sendResponse(req, res, 200, 1, { keyword: "product_added", components: {} });

        }catch (err) {

            return sendResponse(req, res, 200, 0, { keyword: "failed", components: {} });
        }   
    },

    get_product : async (req, res) => {

        try {

            let product = await productSchema.find();
            return sendResponse(req, res, 200, 1, { keyword: "product_list", components: {} },product);

        }catch (err) {

            return sendResponse(req, res, 200, 0, { keyword: "failed", components: {} });
        }
    }
};

module.exports = productModel;