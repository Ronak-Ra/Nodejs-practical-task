const { count } = require('console');
const { required } = require('joi');
const mongoose =  require('mongoose');

const userSchema = new mongoose.Schema({
    full_name : {
        type : String,
        required : true
    },
    social_id :{
        type : String,
        default : ''
    }, 
    email : {
        type: String,
        default : ''
    },
    country_code : {
        type: String,
        default : ''
    },
    mobile_number : {   
        type: Number,
        default : ''
    },
    password : {
        type: String,
        default : ''
    },
    time_zone:{
        type:String,
        default:'',
    },
    device_info: {
        type: JSON,
        default: null,
    },
    login_type : {
        type : String,
        description: "S: Simple login, G: Google login, A: Apple login",
        default:'1',
        enum:["S","G","A"]
    },
    is_verify : {
        type : String,
        description : "0: is not verify, 1: is verify",
        default :"0",
        enum : ["0","1"],
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
    login_status:{
        type: String,
        description: "1: online, 0: offline",
        default: "0",
        enum: ["0", "1"],
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});
  
const userModel = mongoose.model('tbl_user', userSchema);
  
module.exports = userModel
