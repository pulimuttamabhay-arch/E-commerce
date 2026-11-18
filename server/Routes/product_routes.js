import express from 'express'
import { Addproduct ,viewproduct,getproduct,deleteproduct,updateproduct} from '../Controller/productController.js'
import upload, { handleImageUploadError } from '../Middleware/Imageupload.js'
const route = express.Router()
route.post('/addproduct',upload.array('uimage',10),handleImageUploadError,Addproduct)
route.get('/viewproduct',viewproduct)
route.get('/getproduct/:pid',getproduct)
route.put('/updateproduct/:pid',upload.single('uimage'),handleImageUploadError,updateproduct)
route.delete('/deleteproduct/:pid',deleteproduct)

export default route