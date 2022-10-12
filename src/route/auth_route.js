const express=require('express');
const { userRegistration, listUser, loginUser, logout, changePassword } = require('../controller/auth_ctl');
var bodyParser = require('body-parser');
const { loginCheck } = require('../config/helper/middleware');

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

router.use(bodyParser.json())
// router.use(cookieParser());

router.post("/registration",userRegistration);
router.post("/login", loginUser);

router.get("",loginCheck,listUser);
router.post("/changepwd",loginCheck,changePassword);
router.get("/logout",loginCheck,logout);

module.exports=router;
