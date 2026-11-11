import express from 'express'
const route = express.Router()
import {registerAdmin, adminlogin} from '../Controller/adminController.js'

route.post('/addadmin',registerAdmin)
route.post('/login',adminlogin)

export default route