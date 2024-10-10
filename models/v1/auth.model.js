const { sendResponse } = require('../../middleware/headerValidator');
const common = require('../../utils/common');
let md5 = require('md5');
const en = require('../../languages/en')

//Schema
const userSchema = require('./Schema/user_schema');

let authModel = {

    create_account: async (req, res) => {

        let body = req.body;
        
        try {
            
            let user_insert = {};

            if (body.login_type === "S") {

                if(body.email)
                {
                    const existingEmailUser = await userSchema.findOne({ email: body.email,is_active : '1',is_delete : '0'});
                    if(existingEmailUser) throw new Error('duplicate_email')
                    body.email = body.email;
                }
                if(body.country_code && body.mobile_number)
                {   
                    const existingMobileUser = await userSchema.findOne({mobile_number:body.mobile_number,country_code: body.country_code ,is_active : '1',is_delete : '0'});
                    if(existingMobileUser) throw new Error('duplicate_phone')
                    body.country_code = body.country_code;
                    body.mobile_number = body.mobile_number;
                }
                user_insert = {
                    full_name: body.full_name,
                    email : body.email || null,
                    country_code : body.country_code || null,
                    mobile_number : body.mobile_number || null,
                    password: md5(body.password),
                    login_type: body.login_type,
                    time_zone: body.time_zone
                }

            } else {

                const existingSocialUser = await userSchema.findOne({ social_id : body.social_id,is_active : '1',is_delete : '0'});
                if(existingSocialUser) throw new Error('duplicate_social_id')

                user_insert = {
                    full_name: body.full_name,
                    email: body.email || null,
                    country_code : body.country_code || null,
                    phone: body.phone || null,
                    password: null,
                    login_type: body.login_type,
                    social_id: body.social_id,
                    time_zone: body.time_zone
                }
            }
            const newUser = new userSchema(user_insert);
            let insertId = await newUser.save();
            body.user_id = insertId._id;
            
            let user_device_insert = {
                device_token: body.device_token,
                device_type: body.device_type,
                device_name: body.device_name,
                uuid: body.uuid,
                model_name: body.model_name,
                os_version: body.os_version,
                ip: body.ip,
                token : common.jwt_sign(body.user_id)
            }
            await userSchema.updateOne({_id : body.user_id},{ $set : { device_info : user_device_insert} });
            
            let user_details = await common.user_details(body.user_id);

            return sendResponse(req, res, 200, 1, { keyword: "account_created", components: {} }, user_details);
        }
        catch (e) {
            
            let keyword = "failed";
            let components = {};

            if (e.message === "duplicate_email") {
                
                keyword = "duplicate_email";

            } else if (e.message === "duplicate_phone") {

                keyword = "duplicate_phone";

            } else if (e.message === "duplicate_social_id") {

                keyword = "duplicate_social_id";
            }

            return sendResponse(req, res, 200, 0, { keyword: keyword, components: components });
        }
    },

    sign_in: async (req, res) => {

        try {
            let body = req.body;
            let user_id = 0;
            let user;

            if (body.login_type === "S") {

                let enc_password = md5(body.password);

                if(body.email){

                    user = await userSchema.findOne({email : body.email})
                }
                if(body.country_code && body.mobile_number){

                    user = await userSchema.findOne({country_code : body.country_code,mobile_number : body.mobile_number})
                }
                if(user == null) throw new Error("no_data")                
                user_id = user._id;

                if (user.password == enc_password) {

                    if (user.is_active == 0) {

                        throw new Error("user_inactive_by_admin");

                    }else if (user.is_delete == 1) {
                        
                        throw new Error("user_deleted_by_admin");
                    }

                } else {

                    throw new Error("invalid_password");
                }

            } else {

                user = await userSchema.findOne({
                    social_id: body.social_id,
                    login_type: { $ne: 'S' }
                });

                user_id = user._id;

                if (user.is_active == 0) {

                    throw new Error("user_inactive_by_admin");

                } else if (user.is_delete == 1) {
                        
                    throw new Error("user_deleted_by_admin");
                }
            }

            let update_data = {
                device_token: body.device_token,
                device_type: body.device_type,
                device_name: body.device_name,
                uuid: body.uuid,
                model_name: body.model_name,
                os_version: body.os_version,
                ip: body.ip,
                token: common.jwt_sign(user_id)
            };

            await userSchema.updateOne(
                {_id : user_id},
                { $set : 
                    { 
                        time_zone: body.time_zone,
                        device_info : update_data
                    } 
                }
            );

            let user_details = await common.user_details(user_id);

            return sendResponse(req, res, 200, 1, { keyword: "signin_success", components: {} }, user_details);

        } catch (e) {
            
            let keyword = "failed";
            let code = 0;

            if (e.message === "invalid_password") {

                keyword = "invalid_password";

            } else if (e.message === "user_inactive_by_admin") {

                keyword = "user_inactive_by_admin";

            } else if (e.message === "no_data") {

                keyword = "user_not_found";

                if (req.body?.login_type != "S") code = 10

            } else if (e.message === "user_deleted_by_admin") {

                keyword = "user_deleted_by_admin";
            }

            return sendResponse(req, res, 200, code, { keyword: keyword, components: {} });
        }
    },

    logout: async (req, res) => {
        try {
            let { user_id } = req.loginUser;

            await userSchema.findOneAndUpdate(
                {_id : user_id},
                { 
                    $set : { 
                        "device_info.token": null,
                        "device_info.device_token": null
                    }
                }
            );
            return sendResponse(req, res, 200, 1, { keyword: "logout_success", components: {} });

        } catch (e) {

            return sendResponse(req, res, 200, 0, { keyword: "failed", components: {} });
        }
    },
};

module.exports = authModel;