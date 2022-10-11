require('dotenv').config();

const userSchema = require("../../model/user_model");
var jwt = require('jsonwebtoken');
const postSchema = require('../../model/post_model');
const articalSchema = require('../../model/artical_model');

module.exports={
    checkUserExistOrNot:async(email,t)=>{
       return await userSchema.findOne({where:{email}},{transaction:t});
    },
    generateLoginToken: async (userData) => {
        var token = jwt.sign({
            id: userData.id,
            userName: userData.name,
            email: userData.email
        }, process.env.LOGIN_SECRET_KEY, {
            expiresIn: '1h'
        });
        return token;
    },
    tokenMatch: async (userId, token) => {
        return await userSchema.findOne({ where: 
             { id: userId, 
                 loginToken: token, 
             } })
     },
     returnDecodedToken:async(req)=>{
        const token = req.headers.authorization.split(' ')[1];
        return await jwt.verify(token, process.env.LOGIN_SECRET_KEY);
    },
    checkPostExist:async(postId)=>{
        return postSchema.findOne({
            where:{id:postId}
        })
    },
    checkArticalExist:async(articalId)=>{
        return articalSchema.findOne({
            where:{id:articalId}
        })
    }
}