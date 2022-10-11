const sequelize = require("../config/db_conn");
const userSchema = require("./user_model");


const relationship = () => {
    userSchema
    sequelize.sync();
    // sequelize.sync({force: true});   
    // {force: true}
}
module.exports = relationship;
// https://javascript.plainenglish.io/password-encryption-using-bcrypt-sequelize-and-nodejs-fb9198634ee7