require('dotenv').config();

const { tokenMatch } = require("./helper_func");
var jwt = require('jsonwebtoken');


//for check login user jwt
const loginCheck = async (req, res, next) => {
    try {
  
      if (!req.headers['authorization']) {
        res.status(403).json({
          message: "Token Not get"
        });
      } else {
        const token = req.headers.authorization.split(' ')[1];
        await jwt.verify(token, process.env.LOGIN_SECRET_KEY, async (err, payload) => {
            console.log(err)

          if (err) {
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            res.status(404).json({message: message});
          } else {
            const user = await tokenMatch(payload.id, token);
            if(user)
            next();
            else
            res.status(404).json({message:"you allready logout"})
          }
        });
      }
    } catch (error) {
      res.status(401).json({
        message: error
      });
    }
  
  }

  module.exports={loginCheck}