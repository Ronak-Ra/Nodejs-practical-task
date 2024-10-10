const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tbl_user',
        required: true
    },
    amount : {
        type: Number,
        required: true
    },
    shipping_address : {
        type: String,
        required: true
    },
    order_status : {
        type: String,
        default: 'PENDING',
        enum: ['PENDING','CONFIRM','SHIPPED','DELIVERED','REJECTED'],
        required: true
    },
    order_date : {
        type: Date,
        default: Date.now
    },
    shipping_date : {
        type: Date,
        default: null
    },
    delivery_date :{
        type: Date,
        default: null
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

const orderModel = mongoose.model('tbl_order', orderSchema);

module.exports = orderModel;