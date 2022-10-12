require('dotenv').config();

const express=require("express");
const app=express();
const port=process.env.PORT||3000;
const relationship = require("./src/model/relationship");
const articalRouter = require('./src/route/artical_route');
const router = require("./src/route/auth_route");
const postRouter = require('./src/route/post_route');

relationship();
app.set('view engine', 'ejs');

app.use("/user",router)
app.use("/post",postRouter)
app.use("/artical",articalRouter)

app.listen(port,()=>{
    console.log("Listen to port Number :",port)
})