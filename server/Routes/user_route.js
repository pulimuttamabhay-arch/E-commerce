import express from 'express'
const route = express.Router()
import { adduser, Login ,viewuser,getuser,Deleteuser,updateprofile,uploadprofileimage,updateuserstatus} from '../Controller/user_controller.js'
import { Count } from '../Controller/Count.js'
import upload from '../Middleware/Imageupload.js'
route.post('/adduser',adduser)
route.post('/login',Login)
route.get('/viewusers',viewuser)
route.get('/getuser/:uid',getuser)
route.delete('/delete/:uid',Deleteuser)
route.put('/uploadprofileimage/:uid', upload.single('profileimage'), uploadprofileimage)
route.put('/updateprofile/:uid', updateprofile)
route.put('/updatestatus/:uid', updateuserstatus)


// count of document

route.get('/Count',Count)
export default route