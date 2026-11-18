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

export const handleImageUploadError = (error, req, res, next) => {
    if (!error) {
        return next()
    }

    const isMulterError = error instanceof multer.MulterError
    const isInvalidImage = error.message === 'Only image uploads are supported'

    console.error('Image upload failed:', {
        name: error.name,
        message: error.message,
        http_code: error.http_code
    })

    return res.status(isMulterError || isInvalidImage ? 400 : 502).json({
        success: false,
        message: isMulterError || isInvalidImage
            ? error.message
            : 'Cloudinary image upload failed. Check the server Cloudinary configuration.'
    })
}

export default uploads