const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db_conn')

const articalImageSchema = sequelize.define("articalimage", {
    image: {
        type: Sequelize.TEXT,
    }
});
module.exports = articalImageSchema;