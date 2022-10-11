const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db_conn')
const postSchema = sequelize.define("post", {
  name: {
    type: Sequelize.STRING(50)
  },
  content: {
    type: Sequelize.TEXT,
  }
}, 
{
  tableName: 'post',
  paranoid:true
});

module.exports = postSchema;