require('dotenv').config();

const userSchema = require("../../model/user_model");
var jwt = require('jsonwebtoken');

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
}