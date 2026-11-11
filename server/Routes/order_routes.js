
import express from 'express'

import {
    Addorder,
    Vieworder,
    Myorders,
    Getorder,
    Updateorderstatus,
    Updatepaymentstatus,
    Cancelorder,
    Requestreturn,
    Reviewreturn,
    CompleteManualRefund
} from '../Controller/orderController.js'

import { verifyToken } from '../Middleware/authMiddleware.js'
import { verifyAdmin } from '../Middleware/adminMiddleware.js'

const router = express.Router()

router.post('/addorder', verifyToken, Addorder)

router.get('/vieworder', Vieworder)

router.get('/myorders', verifyToken, Myorders)

router.get('/getorder/:oid', verifyToken, Getorder)

router.put('/updateorderstatus/:oid', Updateorderstatus)

router.put('/updatepaymentstatus/:oid', verifyToken, Updatepaymentstatus)

router.put('/cancelorder/:oid', verifyToken, Cancelorder)
router.post('/returnrequest/:oid', verifyToken, Requestreturn)
router.put('/reviewreturn/:oid', verifyAdmin, Reviewreturn)
router.put('/completemanualrefund/:oid', verifyAdmin, CompleteManualRefund)

export default router
