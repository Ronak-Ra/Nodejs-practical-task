const mongoose = require('mongoose');

let cartSchema = new mongoose.Schema({
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tbl_user',
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
    addcart_date : {
        type: Date,
        default: Date.now
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
});

const cartModel = mongoose.model('tbl_cart', cartSchema);

module.exports = cartModel;