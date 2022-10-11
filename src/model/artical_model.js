const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db_conn')
const articalSchema = sequelize.define("artical", {
  name: {
    type: Sequelize.STRING(50)
  },
  image: {
    type: Sequelize.STRING(255),
  },
  content: {
    type: Sequelize.TEXT,
  }
}, 
{
  tableName: 'artical',
  paranoid:true
});

module.exports = articalSchema;