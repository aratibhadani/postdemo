const express=require('express');
const { userRegistration, listUser, loginUser, logout, changePassword, forgetPassword, getForgetPassword, postForgetPassword, getResetPassword, postResetPassword, sendmail } = require('../controller/auth_ctl');
var bodyParser = require('body-parser');
const { loginCheck } = require('../config/helper/middleware');

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())


router.post("/registration",userRegistration);
router.post("/login", loginUser);

//route for forgot password ,make get route for better understanding
router.post("/forgot-password",postForgetPassword);

router.get("/reset-password/:token",getResetPassword);
router.post("/reset-password/:token",postResetPassword);

// change password after login
router.post("/changepwd",loginCheck,changePassword);
router.get("",loginCheck,listUser);
router.get("/logout",loginCheck,logout);

module.exports=router;
