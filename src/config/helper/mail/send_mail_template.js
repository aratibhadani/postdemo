const path=require('path');
const ejs=require('ejs');
const {  transporter } = require('./mail_send');

module.exports={
    accountCreationTemplate:async(name,email,password)=>{
        // const templatePath=path.join(__dirname,"../../../../views/accountCrete.ejs");
        const templatePath="/home/mind/practice/articleDemo/postdemo/views/accountCrete.ejs"
        const data=await ejs.renderFile(templatePath,{
            name,email,password
        });
       
        var mailOptions = {
            from: 'adminauth@gmail.com',
            to: email,
            subject: 'Sending Email for Account create',
            html: data
        };
        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
               console.log(error)
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        
    },
    forgetPasswordLinkSendTemplate:async(email,link)=>{
  
        const templatePath="/home/mind/practice/articleDemo/postdemo/views/linkSendTEmplate.ejs"
        const data=await ejs.renderFile(templatePath,{
            email,link
        });
       
        var mailOptions = {
            from: 'adminauth@gmail.com',
            to: email,
            subject: 'Sending Email for Forget Password',
            html: data
        };
        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
               console.log(error)
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        
    }};