import express from 'express'
import {
    createReview,
    getProductReviews,
    getAllReviews,
    updateReviewVisibility
} from '../Controller/reviewController.js'

import { verifyToken } from '../Middleware/authMiddleware.js'

const route = express.Router()

route.post('/addreview', verifyToken, createReview)

route.get('/viewreview/:productId', getProductReviews)

route.get('/viewallreviews', getAllReviews)

route.put('/updatereviewvisibility/:id', updateReviewVisibility)

export default route