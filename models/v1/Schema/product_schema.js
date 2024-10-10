const mongoose = require('mongoose');

let productSchema = new mongoose.Schema({

    product_name: {
        type: String,
        required: true
    },
    product_description: {
        type: String,
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    is_active: {
        type: String,
        description: "0: inActive, 1: Active",
        default: "1",
        enum: ["0", "1"],
    },
    is_delete: {
        type: String,
        description: "0: Not Deleted, 1: Delete",
        default: "0",
        enum: ["0", "1"],
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    }
});

const productModel = mongoose.model('tbl_product', productSchema);

module.exports = productModel;