const { uploadmultipleFile } = require("../config/helper/image_upload");
const { postArticalInputValidation } = require("../config/helper/input_validation");
const multer = require("multer");
const { returnDecodedToken, checkArticalExist } = require("../config/helper/helper_func");
const sequelize = require("../config/db_conn");
const userSchema = require("../model/user_model");
const { Op } = require("sequelize");
const articalSchema = require("../model/artical_model");
const articalImageSchema = require("../model/articalImage_model");

module.exports = {
    addArticalData: async (req, res) => {
        const t = await sequelize.transaction();
        const t1 = await sequelize.transaction();
        try {
            uploadmultipleFile(req, res, async function (err) {
                //show image not valied
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_UNEXPECTED_FILE") {
                        return res.status(400).send({ message: "Too many files to upload." });
                    }
                } else if (err) {
                    return res.status(400).json({ message: err });
                } else {
                    let response = postArticalInputValidation(req.body);
                    //validation msg display
                    if (response.error) {
                        return res.status(400).json({message: `${response.error.details[0].message}`});
                    } else {
                        const { name, content } = req.body;
                        console.log(req.files)
                        const loginUser = await returnDecodedToken(req);
                        //store artical data
                        const articalData = await articalSchema.create({
                            name,
                            content,
                            userId: loginUser.id
                        }, { transaction: t1 });
                        await t1.commit(); //1st to commit transaction than after generate new

                        //store artical image data
                        const articalImageArr = await req.files.map(item => {
                            return { image: item.filename, articalId: articalData.id }
                        })


                        const articalImage = await articalImageSchema.bulkCreate(articalImageArr
                            , {ignoreDuplicates: true },
                            { transaction: t }
                        )

                        if (articalData && articalImage) {
                            return  res.status(200).json({ message: "Artical Create successfully" })
                        }
                    }
                }
                await t.commit();
            });
        } catch (error) {
            await t1.rollback();
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Errorgfdgd" })
        }
    },
    editArticalData: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            uploadmultipleFile(req, res, async function (err) {
                //show image not valied
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_UNEXPECTED_FILE") {
                        return res.status(400).send({ message: "Too many files to upload." });
                    }
                } else if (err) {
                    return res.status(400).json({ message: err });
                } else {
                    const articalId = req.param('id');
                    const checkArtical = await checkArticalExist(articalId);
                    //check artical is present or not in db
                    if (!checkArtical) {
                        return res.status(400).json({ message: "Artical is unavailable.."});
                    } else {
                        let response = postArticalInputValidation(req.body);
                        //validation msg display
                        if (response.error) {
                            return res.status(400).json({
                                message: `${response.error.details[0].message}`
                            });
                        } else {
                            const { name, content } = req.body;
                            const editArtical = await articalSchema.update({
                                name,
                                content
                            }, 
                            {where: { id: articalId}},
                             { transaction: t });
                            
                            //store artical image data
                        const articalImageArr = await req.files.map(item => {
                            return { image: item.filename, articalId: articalId }
                        })
                            const articalImage = await articalImageSchema.bulkCreate(articalImageArr
                                , {ignoreDuplicates: true},
                                 { transaction: t })
                            if (editArtical[0] == 1 && articalImage) {
                                return res.status(200).json({message: "Artical Data Update successfully"})
                            }
                        }
                    }
                }
                await t.commit();
            });
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
    getAllArtical: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const offset = req.query?.offset || null;
            const limit = req.query?.limit || null;
            const search = req.query?.search || '';
            const articalData = await articalSchema.findAndCountAll(
                {
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
                                        content: {
                                            [Op.like]: `%${search}%`
                                        }
                                    }
                                ]
                            }
                        ],

                    }, include: [
                        {
                            model: articalImageSchema,
                            attributes: ['image']
                        },
                        {
                            model: userSchema,
                            attributes: ['name', 'email']
                        }
                    ]
                }, { transaction: t })

            if (articalData.count == 0) {
                return res.status(400).json({message: "No Data Available"})
            } else {
                res.status(200).json({
                    data: articalData.rows,
                    message: "Data get successfully"
                })
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
    deleteArtical: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const articalId = req.param('id');
            //check login user is a add categary or not
            
            const data = await checkArticalExist(articalId);
            if (data) {
                let articalImage = await articalImageSchema.destroy({where: { articalId}}, { transaction: t })
                    let data = await articalSchema.destroy({
                        where: {
                            id: articalId
                        }
                    }, { transaction: t });
                    if (data == 1 ||articalImage==1) {
                       return res.status(200).json({message: "Artical Data Delete successfully"})
                    }
            } else {
                return res.status(404).json({ message: "Artical Not exists" });
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
}