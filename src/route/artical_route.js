const express=require('express');
var bodyParser = require('body-parser');
const { loginCheck } = require('../config/helper/middleware');
const { addArticalData, editArticalData, deleteArtical, getAllArtical } = require('../controller/artical_ctl');

const articalRouter = express.Router()
articalRouter.use(bodyParser.urlencoded({ extended: false }))

articalRouter.use(bodyParser.json())
articalRouter.post("/",loginCheck,addArticalData);
articalRouter.put("/:id",loginCheck,editArticalData);
articalRouter.delete("/:id",loginCheck,deleteArtical);

articalRouter.get("",loginCheck,getAllArtical);

module.exports =articalRouter;
