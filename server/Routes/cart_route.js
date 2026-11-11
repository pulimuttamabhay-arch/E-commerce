
import express from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} from '../Controller/cartController.js'

import { verifyToken } from '../Middleware/authMiddleware.js'

const router = express.Router()

router.get('/viewcart', verifyToken, getCart)
router.post('/addtocart', verifyToken, addToCart)
router.put('/updatecart/:productId', verifyToken, updateCartItem)
router.delete('/removecart/:productId', verifyToken, removeCartItem)

export default router