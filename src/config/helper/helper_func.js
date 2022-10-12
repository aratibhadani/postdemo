require('dotenv').config();
const bcrypt = require('bcrypt');

const userSchema = require("../../model/user_model");
var jwt = require('jsonwebtoken');
const saltRounds = 10;
const postSchema = require('../../model/post_model');
const articalSchema = require('../../model/artical_model');

module.exports = {
    //create common function for check user is exists or not
    checkUserExistOrNot: async (email, t) => {
        return await userSchema.findOne({ where: { email } }, { transaction: t });
    },
    //create common function for generate token
    generateJwtToken:async(userData,secretKey,expDuration)=>{
        return jwt.sign({
            id: userData.id,
            userName: userData.name,
            email: userData.email
        }, secretKey, {
            expiresIn: expDuration
        });
    },
    //create common function for token match
    tokenMatch: async (userId, token) => {
        return await userSchema.findOne({
            where:
            {
                id: userId,
                loginToken: token,
            }
        })
    },
    //create common function for forget password token match
    forgetTokenCompare:async(token,secret)=>{
        return await jwt.verify(token, secret);
    },
    //return decoded token value
    returnDecodedToken: async (req) => {
        const token = req.headers.authorization.split(' ')[1];
        return await jwt.verify(token, process.env.LOGIN_SECRET_KEY);
    },
    //common for convert password into hash password
    passwordConvertHash: async (password) => {
        const salt = await bcrypt.genSaltSync(saltRounds);
        return await bcrypt.hashSync(password, salt);
    },
    //common for comparing password
    comparePassword: async (password, dbPassword) => {
        return await bcrypt.compare(password, dbPassword)
    },
    //check post is present or not in db
    checkPostExist: async (postId) => {
        return postSchema.findOne({
            where: { id: postId }
        })
    },
    //check artical is present or not in db
    checkArticalExist: async (articalId) => {
        return articalSchema.findOne({
            where: { id: articalId }
        })
    }
}