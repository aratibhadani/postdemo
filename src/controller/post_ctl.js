const { uploadmultipleFile } = require("../config/helper/image_upload");
const { postArticalInputValidation } = require("../config/helper/input_validation");
const multer = require("multer");
const postSchema = require("../model/post_model");
const { returnDecodedToken, checkPostExist } = require("../config/helper/helper_func");
const postImageSchema = require("../model/postImage_model");
const sequelize = require("../config/db_conn");
const userSchema = require("../model/user_model");
const { Op } = require("sequelize");

module.exports = {

    //for add post
    addPostData: async (req, res) => {
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
                        return res.status(400).json({ message: `${response.error.details[0].message}` });
                    } else {
                        const { name, content } = req.body;

                        const loginUserId = await returnDecodedToken(req);
                        //store post data
                        const postData = await postSchema.create({
                            name,
                            content,
                            userId: loginUserId.id
                        }, { transaction: t1 });
                        await t1.commit(); //1st to commit transaction than after generate new

                        //store post image data
                        const postImageArr = await req.files.map(item => {
                            return { image: item.filename, postId: postData.id }
                        })
                        const postImage = await postImageSchema.bulkCreate(
                            postImageArr,
                            { ignoreDuplicates: true },
                            { transaction: t }
                        )

                        if (postData && postImage) {
                           return  res.status(200).json({ message: "Post Create successfully" })
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
    editPostData: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            uploadmultipleFile(req, res, async function (err) {
                //show image not valied
                if (err instanceof multer.MulterError) {
                    console.log(err)
                    if (err.code === "LIMIT_UNEXPECTED_FILE") {
                        return res.status(400).send({ message: "Too many files to upload." });
                    }
                } else if (err) {
                    return res.status(400).json({ message: err });
                } else {
                    const postId = req.param('id');
                    const checkPost = await checkPostExist(postId);
                    //check post is present or not in db
                    if (!checkPost) {
                        return res.status(400).json({ message: "Post is unavailable.." });
                    } else {
                        let response = postArticalInputValidation(req.body);
                        //validation msg display
                        if (response.error) {
                            return res.status(400).json({ message: `${response.error.details[0].message}` });
                        } else {
                            const { name, content } = req.body;
                            const editPost = await postSchema.update({
                                name,
                                content
                            },
                                { where: { id: postId } },
                                { transaction: t });
                            //store post image  in array 
                            const postImageArr = await req.files.map(item => {
                                return { image: item.filename, postId: postId }
                            });
                            const postImage = await postImageSchema.bulkCreate(postImageArr
                                , { ignoreDuplicates: true, },
                                { transaction: t })
                            if (editPost[0] == 1 && postImage) {
                                return res.status(200).json({ message: "Post Data Update successfully" })
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
    getAllPost: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const offset = req.query?.offset || null;
            const limit = req.query?.limit || null;
            const search = req.query?.search || '';
            const postData = await postSchema.findAndCountAll(
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
                            model: postImageSchema,
                            attributes: ['image']
                        },
                        {
                            model: userSchema,
                            attributes: ['name', 'email']
                        }
                    ]
                }, { transaction: t })
            if (postData.count == 0) {
                return res.status(400).json({message: "No Data Available" })
            } else {
                return res.status(200).json({
                    data: postData.rows,
                    message: "Data get successfully"
                })
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
    deletePost: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const postId = req.param('id');

            //check login user is a add categary or not
            const data = await checkPostExist(postId);
            if (data) {
                let postImage = await postImageSchema.destroy({ where: { postId } }, { transaction: t })
                let data = await postSchema.destroy(
                    { where: { id: postId } },
                    { transaction: t });

                if (data == 1) {
                    return res.status(200).json({ message: "Post Data Delete successfully" })
                }
            } else {
                return res.status(404).json({ message: "Post Not exists" })
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
}