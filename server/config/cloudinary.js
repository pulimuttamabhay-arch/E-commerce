import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary';

const cloudinaryCredentials = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
}

if (Object.values(cloudinaryCredentials).some((value) => !value)) {
    throw new Error('Cloudinary credentials are not fully configured')
}

cloudinary.config(cloudinaryCredentials)

export default cloudinary