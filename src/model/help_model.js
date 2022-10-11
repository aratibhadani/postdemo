const bcrypt = require('bcrypt');
var userSchema = sequelize.define("users", {
  userId: {
    field: 'user_id',
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  password: {
    field: 'user_password',
    type: Sequelize.STRING,
    allowNull: true
  },
  name: {
    type: Sequelize.STRING,
    field: 'user_name',
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    field: 'user_email',
    allowNull: false
  },
},
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSaltSync(10, 'a');
          user.password = bcrypt.hashSync(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSaltSync(10, 'a');
          user.password = bcrypt.hashSync(user.password, salt);
        }
      }
    },
    instanceMethods: {
      validPassword: (password) => {
        return bcrypt.compareSync(password, this.password);
      }
    }
  }
);
userSchema.prototype.validPassword = async (password, hash) => {
  return await bcrypt.compareSync(password, hash);
}
return userSchema;


//ri8 data

module.exports = {
  userRegistration: async (req, res) => {
      const response = createUserValidation(req.body);
      const t = await sequelize.transaction();
      try {
          if (response.error) {
          console.log(response.error)

              res.status(400).json({
                  message: `${response.error.details[0].message}`
              });
          } else {
              const { name, email, contactno, password} = req.body;
              //check email exists or not
              const checkEmail = await checkUserExistOrNot(email, t);

              if (checkEmail) {
                  return res.status(409).json({
                      message: "Email already exists"
                  })
              } else {

                  const hashPass = await bcrypt.hash(password, saltRounds);
                  const user = await userSchema.create({ name, email, contactno, password: hashPass }
                      , { transaction: t }
                  );
                  await t.commit();
                  if (user) {
                      return res.status(200).json({
                          message: "User created successfully"
                      })
                  }
              }
              
          }
          
      } catch (error) {
          await t.rollback();
          return res.status(500).json({
              message: "Internal Server Error..."
          })
      }



  },
  loginUser: async (req, res) => {
      const { email, password } = req.body;
      const response = loginValidation(req.body);
      const t = await sequelize.transaction();
      try {
      if (response.error) {
          res.status(400).json({
              message: `${response.error.details[0].message}`
          });
      } else {
          const userData = await checkUserExistOrNot(email, t);

          if (!userData) {
              res.status(400).json({
                  message: "User Not Found"
              })
          } else {
              if (bcrypt.compare(password, userData.password)) {
                  const token = await generateLoginToken(userData)

                  await userSchema.update({
                      loginToken: token
                  }, { where: { id: userData.id } }, { transaction: t });


                  res.status(200).json({
                      token: token,
                      message: "login successfully"
                  });
              } else {
                  res.status(401).json({
                      message: "Unauthorized User"
                  })
              }
          }
      }
      await t.commit();
      } catch (error) {
          await t.rollback();
          res.status(500).json({ message: "Internal Server Error" })
      }
  },
  listUser: async (req, res) => {
      const t = await sequelize.transaction();
      try {
          const offset = parseInt(req.query?.offset) || null;
          const limit = parseInt(req.query?.limit) || null;
          const search = req.query?.search || '';
          const userData = await userSchema.findAndCountAll({
              attributes: ['id', 'name', 'email'],
              limit: limit,
              offset: offset,
              where: {
                  [Op.and]: [
                      {
                          [Op.or]: [
                              {
                                  name: {
                                      [Op.like]: `%${search}%`
                                  }
                              },
                              {
                                  email: {
                                      [Op.like]: `%${search}%`
                                  }
                              }
                          ]
                      },
                  ],

              }
          }
              , { transaction: t }
          );
          if (userData.count == 0) {
              res.status(404).json({ message: "no any User Present in DB" })
          } else {
              res.status(200).json({
                  data: userData.rows,
                  totalUser: userData.count,
                  message: "Data get successfully"
              })
          }
          await t.commit();
      } catch (error) {
          await t.rollback();
          res.status(500).json({ message: "Internal Server Error" })
      }
  },
  logout: async (req, res) => {
      const t = await sequelize.transaction();
      try {
          const userId = await checkToken(req);
          const data = await userSchema.update({
              loginToken: ""
          }, { where: { id: userId } });
          if (data[0] == 1) {
             

              res.status(200).json({ message: "logout successfully" })
          }
          await t.commit();
      } catch (err) {
          await t.rollback();
          console.log(err)
      }
  }
}