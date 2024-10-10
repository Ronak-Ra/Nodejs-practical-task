const mongoose = require('mongoose');

let orderItemSchema = {

    order_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tbl_order',
        required: true
    },
    product_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tbl_product',
        required: true
    },
    quantity : {
        type: Number,
        required: true
    },
    unit_price : {
        type: Number,
        required: true
    },
    total_price : {
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
    create_at : { 
        type: Date, 
        default: Date.now 
    },
    update_at : { 
        type: Date, 
        default: Date.now 
    }
};

const orderItemModel = mongoose.model('tbl_order_item', orderItemSchema);

module.exports = orderItemModel;