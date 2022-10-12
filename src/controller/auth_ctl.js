require('dotenv').config();

const userSchema = require("../model/user_model");
const { checkUserExistOrNot, returnDecodedToken, passwordConvertHash, comparePassword, generateJwtToken, forgetTokenCompare, } = require("../config/helper/helper_func");
const sequelize = require("../config/db_conn");
const { Op } = require("sequelize");
const { createUserValidation, loginValidation, changePasswordValidation, forgetPasswordValidation, changeForgetPasswordValidation } = require("../config/helper/input_validation");
const { resetPasswordLink } = require('../config/helper/enum_data');
const accountCreationTemplate = require('../config/helper/mail/send_mail_template');
const { forgetPasswordLinkSendTemplate } = require('../config/helper/mail/send_mail_template');
const forgetSecret = process.env.JWT_SECRET_FORGETPASSWORD;

module.exports = {
    //user add
    userRegistration: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const response = createUserValidation(req.body);
            if (response.error) {
                return res.status(400).json({ message: `${response.error.details[0].message}` });
            } else {
                const { name, email, contactno, password } = req.body;
                //check email exists or not
                const checkEmail = await checkUserExistOrNot(email, t);
                if (checkEmail) {
                    return res.status(409).json({ message: "Email already exists" });
                } else {
                    const user = await userSchema.create({ name, email, contactno, password: password }, { transaction: t });
                    await t.commit();
                    if (user) {
                        await accountCreationTemplate(name,email,password);
                        return res.status(200).json({ message: "User created successfully" })
                    }
                }
            }
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error..." })
        }
    },
    loginUser: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const response = loginValidation(req.body);
            if (response.error) {
                return res.status(400).json({ message: `${response.error.details[0].message}` });
            } else {
                const { email, password } = req.body;
                const userData = await checkUserExistOrNot(email, t);

                if (!userData) {
                    return res.status(400).json({ message: "User Not Found" })
                } else {
                    if (await comparePassword(password, userData.password)) {
                        const token = await generateJwtToken(userData, process.env.LOGIN_SECRET_KEY,'1h')
                        await userSchema.update(
                            { loginToken: token },
                            { where: { id: userData.id } },
                            { transaction: t }
                        );
                        res.status(200).json({
                            token: token,
                            message: "login successfully"
                        });
                    } else {
                        return res.status(401).json({ message: "Unauthorized User" })
                    }
                }
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
    listUser: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const offset = parseInt(req.query?.offset) || null;
            const limit = parseInt(req.query?.limit) || null;
            const search = req.query?.search || '';
            const userData = await userSchema.findAndCountAll({
                attributes: ['id', 'name', 'email'],
                limit: limit,
                offset: offset,
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                {
                                    name: {
                                        [Op.like]: `%${search}%`
                                    }
                                },
                                {
                                    email: {
                                        [Op.like]: `%${search}%`
                                    }
                                }
                            ]
                        },
                    ],

                }
            }
                , { transaction: t }
            );
            if (userData.count == 0) {
                return res.status(404).json({ message: "no any User Present in DB" })
            } else {
                res.status(200).json({
                    data: userData.rows,
                    totalUser: userData.count,
                    message: "Data get successfully"
                })
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
    changePassword: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const response = changePasswordValidation(req.body);
            if (response.error) {
                res.status(400).json({
                    message: `${response.error.details[0].message}`
                });
            } else {
                const { oldPassword, newPassword } = req.body;
                const loginUser = await returnDecodedToken(req);
                const userData = await checkUserExistOrNot(loginUser.email, t);
                if (await comparePassword(oldPassword, userData.password)) {
                    const hashPassword = await passwordConvertHash(newPassword);
                    const userUpdate = await userSchema.update({ password: hashPassword }, {
                        where: {
                            id: userData.id,
                            email: userData.email
                        }
                    }, { transaction: t });
                    if (userUpdate == 1) {
                        res.status(200).json({ message: "Password change" })
                    }
                    t.commit();
                } else {
                    return res.status(401).json({ message: "Unauthorized User" })
                }
            }
        } catch (error) {
            t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
    postForgetPassword: async (req, res) => {
        const t = await sequelize.transaction();

        try {
            const response = forgetPasswordValidation(req.body);
            if (response.error) {
                return res.status(400).json({ message: `${response.error.details[0].message}` });
            } else {
                const { email } = req.body;
                const userData = await checkUserExistOrNot(email, t);
                if (userData) {
                    const token = await generateJwtToken(userData, forgetSecret, '15m');
                    //token store in db
                    await userSchema.update({
                        forgetToken: token
                    }, {
                        where: { email, id: userData.id }
                    },{transaction:t})
                    t.commit();
                    await forgetPasswordLinkSendTemplate(email,`${resetPasswordLink}/${token}`)
                    return res.status(200).json({
                        message: "link send successfully check In mail",
                    });
                } else {
                    return res.status(404).json({ message: "User Not Register" })
                }
            } 
        } catch (error) {
            t.rollback();
            return res.status(500).json({ message: "Internal Server Error..." })
        }  
    },
    getResetPassword: async (req, res) => {
        const t = await sequelize.transaction();

        try {
            const { token } = req.params;
            //url token
            const decodedtoken = await forgetTokenCompare(token, forgetSecret);
    
            const userData =  await checkUserExistOrNot(decodedtoken.email,t)
    
            if (userData.forgetToken) {
                res.render('reset-password', { email: userData.email })
            }
            else {
                res.status(400).send({ message: "link is expired" })
            }
            t.commit();
        } catch (error) {
            t.rollback();
            return res.status(500).json({ message: "Internal Server Error..." })
        }
    },
    postResetPassword: async (req, res) => {
        const t = await sequelize.transaction();

        try {
            const response = changeForgetPasswordValidation(req.body);
            if (response.error) {
                console.log(response.error)
                return res.status(400).json({ message: `${response.error.details[0].message}` });
            } else {
                const { token } = req.params;
                const { password } = req.body
                //url token check
                const decodedtoken = await forgetTokenCompare(token, forgetSecret);
                const userData = await checkUserExistOrNot(decodedtoken.email,t)
        
                if (!userData) {
                    return res.status(404).json({ message: "user not exits" });
                }
                if (userData.forgetToken == "") {
                    return res.status(400).json({ message: "Link expired" });
                }
                //db token check
                const dbDecodeToken = await forgetTokenCompare(userData.forgetToken, forgetSecret)
        
                if (decodedtoken.id === dbDecodeToken.id || decodedtoken.email === dbDecodeToken.email) {
                    const hashpassword = await passwordConvertHash(password)
                    const updateData = await userSchema.update({
                        password: hashpassword,
                        forgetToken: ""
                    }, {
                        where: {
                            email: dbDecodeToken.email, id: dbDecodeToken.id
                        }
                    });
                    if (updateData == 1) {
                        return res.status(200).json({ message: "password Updated successfully" })
                    }
                }
                else {
                    res.status(400).send({ message: "link is expired" })
                }
            }
        } catch (error) {
            t.rollback();
            return res.status(500).json({ message: "Internal Server Error..." })
        }
       
    },
    logout: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const userData = await returnDecodedToken(req);
            const data = await userSchema.update({
                loginToken: ""
            }, { where: { id: userData.id, email: userData.email } });
            if (data[0] == 1) {
                res.status(200).json({ message: "logout successfully" })
            }
            await t.commit();
        } catch (err) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }
}