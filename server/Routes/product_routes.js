import express from 'express'
import { Addproduct ,viewproduct,getproduct,deleteproduct,updateproduct} from '../Controller/productController.js'
import upload from '../Middleware/Imageupload.js'
const route = express.Router()
route.post('/addproduct',upload.array('uimage',10),Addproduct)
route.get('/viewproduct',viewproduct)
route.get('/getproduct/:pid',getproduct)
route.put('/updateproduct/:pid',upload.single('uimage'),updateproduct)
route.delete('/deleteproduct/:pid',deleteproduct)

export default route