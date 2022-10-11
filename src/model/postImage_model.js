const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db_conn')


const postImageSchema = sequelize.define("postimage", {
    image: {
        type: Sequelize.TEXT,
    }
});
module.exports = postImageSchema;