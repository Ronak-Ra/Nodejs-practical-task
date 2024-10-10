const mongoose = require('mongoose');

let paymentSchema = new mongoose.Schema({
    order_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tbl_order',
        required: true
    },
    payment_method : {
        type: String,
        default: 'COD',
        enum: ['COD','CARD'],
        required: true
    },
    payment_status : {
        type: String,
        default: 'PENDING',
        enum: ['PENDING','SUCCESS','FAILED'],
        required: true
    },
    payment_date : {
        type: Date,
        default: Date.now
    },
    amount_paid : {
        type: Number,
        required: true
    },
    payment_details : {
        type : JSON,
        default : null
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

const paymentModel = mongoose.model('tbl_payment', paymentSchema);

module.exports = paymentModel;