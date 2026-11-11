import express from 'express'
const route = express.Router()
import { addcategory, viewcategory,getcategory ,deletecategory,updatecategory} from '../Controller/categoryController.js'
import { verifyToken } from '../Middleware/authMiddleware.js'
import upload from '../Middleware/Imageupload.js'

route.post('/addcategory',upload.single('uimage'),addcategory)
route.get('/viewcategory',viewcategory)
route.delete('/deletecategory/:cid',deletecategory)
route.put('/updatecategory/:cid',upload.single('uimage'),updatecategory)
route.get('/getcategory/:cid',getcategory)
export default route