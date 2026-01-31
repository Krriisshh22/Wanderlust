const cloudinary = require ("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary")

cloudinary.config({
    cloud_name: process.env.SECRET_NAME,
    api_key: process.envCLOAD_API_KEY,
    api_secret: process.envCLOAD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});

module.exports= {
    cloudinary,
    CloudinaryStorage,
}