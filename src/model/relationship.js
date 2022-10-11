const sequelize = require("../config/db_conn");
const articalImageSchema = require("./articalImage_model");
const articalSchema = require("./artical_model");
const postImageSchema = require("./postImage_model");
const postSchema = require("./post_model");
const userSchema = require("./user_model");


const relationship = () => {
    userSchema.hasMany(postSchema);
    postSchema.belongsTo(userSchema);

    userSchema.hasMany(articalSchema);
    articalSchema.belongsTo(userSchema);

    //relationship between post table and post image table
    postSchema.hasMany(postImageSchema);
    postImageSchema.belongsTo(postSchema);

    //relationship between artical table and artical image table
    articalSchema.hasMany(articalImageSchema);
    articalImageSchema.belongsTo(articalSchema);

    sequelize.sync();
    // sequelize.sync({force: true});   
   
}
module.exports = relationship;
// https://javascript.plainenglish.io/password-encryption-using-bcrypt-sequelize-and-nodejs-fb9198634ee7