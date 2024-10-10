require('dotenv').config();
const jwt = require('jsonwebtoken');
const userSchema = require('../models/v1/Schema/user_schema')

const common = {

    jwt_sign: (user_id, expiresIn = "365days") => {
        const enc_data = {
            expiresIn,
            data: { user_id }
        }

        const token = jwt.sign(enc_data, process.env.JWT_SECRET_KEY);

        return token;
    },

    user_details: async (user_id) => {
        try {
            const user_details = await userSchema.findOne({ _id: user_id });

            return user_details;

        } catch (e) {

            throw new Error("user_not_found");
        }

    },
}

module.exports = common;
