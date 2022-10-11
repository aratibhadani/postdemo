var multer = require('multer');
const { v4: uuidv4 } = require('uuid');

var storage = multer.diskStorage({
  destination: 'public',
  // filename: (req, file, cb) => {
  //   cb(null, file.originalname)
  // },
  filename: function (req, file, cb) {
    const randomPart = uuidv4(); // use whatever random you want.
    const extension = file.mimetype.split('/')[1];
    cb(null, randomPart + `.${extension}`)

  },
  onError: function (err, next) {
    next(err);
  }
})
var upload = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    console.log(file)
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "video/quicktime"|| file.mimetype == "video/mp4") {
      cb(null, true);
    } else {
      return cb(new Error('Invalid file upload type:(png, jpeg ,jpg)'));
    }
  }
});
const uploadmultipleImage = upload.array('files', 5);
module.exports = { uploadmultipleImage };