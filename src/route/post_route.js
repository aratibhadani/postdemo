const express=require('express');
var bodyParser = require('body-parser');
const { loginCheck } = require('../config/helper/middleware');
const { getAllPost, addPostData, editPostData, deletePost } = require('../controller/post_ctl');

const postRouter = express.Router()
postRouter.use(bodyParser.urlencoded({ extended: false }))

postRouter.use(bodyParser.json())
postRouter.post("/addpost",loginCheck,addPostData);
postRouter.put("/editpost/:id",loginCheck,editPostData);

postRouter.delete("/:id",loginCheck,deletePost);

postRouter.get("",loginCheck,getAllPost);

module.exports=postRouter;
