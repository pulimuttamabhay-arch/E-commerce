import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Uploads',
        resource_type: 'image'
    }
})

const uploads = multer({
    storage: imageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
            return callback(new Error('Only image uploads are supported'))
        }

        return callback(null, true)
    }
})

export default uploads