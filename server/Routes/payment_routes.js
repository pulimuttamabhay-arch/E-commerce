import express from 'express'

import {
    createPayment,
    getMyPayments,
    getAllPayments,
    confirmPayment,
    demoCheckout,
    createRazorpayOrder,
    verifyRazorpayPayment
} from '../Controller/paymentController.js'

import { verifyToken } from '../Middleware/authMiddleware.js'
import {Count} from '../Controller/Count.js'

const router = express.Router()

// Existing Payment Routes
router.post('/createpayment', verifyToken, createPayment)

router.get('/mypayments', verifyToken, getMyPayments)

router.get('/viewpayment', getAllPayments)

// Razorpay Test Payment Routes
router.post('/create-razorpay-order', verifyToken, createRazorpayOrder)

router.post('/verify-razorpay-payment', verifyToken, verifyRazorpayPayment)

// COD Checkout
router.post('/demo-checkout', verifyToken, demoCheckout)

// Payment Count
router.get('/Count', Count)

export default router   