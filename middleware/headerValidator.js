require('dotenv').config();
const en = require('../languages/en.js');
const { default: localizify } = require('localizify');
const { t } = require('localizify');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/v1/Schema/user_schema')


const checkApiKey = function (req, res, next) {

    if (req.headers['api-key'] === process.env.API_KEY) {

        next();

    } else {

        sendResponse(req, res, 401, '-1', { keyword: 'invalid_api_key', components: {} });
    }
}
const checkToken = async function (req, res, next) {
    try {
        req.loginUser = {};
        const { data } = jwt.verify(req.headers['token'], process.env.JWT_SECRET_KEY);

        req.loginUser.user_id = data.user_id;
        
        if (data.user_id) {

            user_token = `${req.headers['token']}`
            let user = await userSchema.findOne({_id : data.user_id,"device_info.token" : user_token})
            
            if(user == null) throw new Error('token_invalid');
            if(user.is_active == 0) throw new Error('user_inactive_by_admin');
            if(user.is_delete == 1) throw new Error('user_deleted_by_admin');
            next();

        } else {

            throw new Error("token_invalid");
        }
    } catch (e) {
        
        let keyword = 'token_invalid';

        if (e.message == 'user_inactive_by_admin') {

            keyword = 'user_inactive_by_admin'

        }else if(e.message == 'user_deleted_by_admin'){

            keyword = 'user_deleted_by_admin'
        }
        sendResponse(req, res, 401, '-1', { keyword: keyword, components: {} });
    }
}

const sendResponse = function (req, res, statuscode, responsecode, { keyword, components }, responsedata) {
    
    let formatmsg = getMessage(req.headers?.['accept-language'], keyword, components);
    
    let data = { code: responsecode, message: formatmsg, data: responsedata };
    
    res.status(statuscode);
    res.send(data);
}

const getMessage = function (requestLanguage = 'en', key, value) {
    try {
        localizify
            .add('en', en)
            .setLocale(requestLanguage);

        let message = t(key, value);

        return message;
    } catch (e) {
        return "Something went wrong";
    }
}

const validateJoi = (schema) => {
    return (req, res, next) => {

        const options = {
            errors: {
                wrap: {
                    label: false
                }
            }
        };

        const { error } = schema.validate(req.body, options);

        if (error) {
            return res.status(200).json({ code: '0', message: error.details[0].message });
        }

        next();
    };
}

module.exports = { 
    checkApiKey, 
    checkToken,
    sendResponse,
    validateJoi 
};