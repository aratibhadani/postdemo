require('dotenv').config();
const bcrypt = require('bcrypt');

const userSchema = require("../../model/user_model");
var jwt = require('jsonwebtoken');
const saltRounds = 10;
const postSchema = require('../../model/post_model');
const articalSchema = require('../../model/artical_model');

module.exports = {
    checkUserExistOrNot: async (email, t) => {
        return await userSchema.findOne({ where: { email } }, { transaction: t });
    },
    generateJwtToken:async(userData,secretKey,expDuration)=>{
        return jwt.sign({
            id: userData.id,
            userName: userData.name,
            email: userData.email
        }, secretKey, {
            expiresIn: expDuration
        });
    },
    tokenMatch: async (userId, token) => {
        return await userSchema.findOne({
            where:
            {
                id: userId,
                loginToken: token,
            }
        })
    },
    forgetTokenCompare:async(token,secret)=>{
        return await jwt.verify(token, secret);
    },
    returnDecodedToken: async (req) => {
        const token = req.headers.authorization.split(' ')[1];
        return await jwt.verify(token, process.env.LOGIN_SECRET_KEY);
    },
    passwordConvertHash: async (password) => {
        const salt = await bcrypt.genSaltSync(saltRounds);
        return await bcrypt.hashSync(password, salt);
    },
    comparePassword: async (password, dbPassword) => {
        return await bcrypt.compare(password, dbPassword)
    },
    checkPostExist: async (postId) => {
        return postSchema.findOne({
            where: { id: postId }
        })
    },
    checkArticalExist: async (articalId) => {
        return articalSchema.findOne({
            where: { id: articalId }
        })
    }
}