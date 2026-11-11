// import multer from 'multer'
// const imageupload=multer.diskStorage({
//     destination:function(req,file,cb){cb(null,'Upload/')

//     },
// filename:function(req,file,cb){
//     cb(null,Date.now() + '-' + file.originalname)}
// })
// const upload = multer({storage:imageupload})
// export default upload

// import multer from 'multer'
// const imageupload=multer.diskStorage({
//     destination:function(req,file,cb){cb(null,'Upload/')

//     },
// filename:function(req,file,cb){
//     cb(null,Date.now() + '-' + file.originalname)}
// })
// const upload = multer({storage:imageupload})
// export default upload

import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js";

const imagestorage= new CloudinaryStorage({
    cloudinary,
    params:{
        folder:'Uploads'
    }
})

const uploads = multer ({storage:imagestorage})
export default uploads