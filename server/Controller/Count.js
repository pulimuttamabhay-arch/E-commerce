import Order from '../Models/Order.js'
import Product from '../Models/Product.js'
import user from '../Models/user_model.js'
import Review from '../Models/Review.js'
import Category from '../Models/Category.js'

import Payment from '../Models/Payment.js'

// View All Orders (Admin)
export const Count = async (req, res) => {
    try {
        const allorder = await Order.countDocuments()
        const allproduct = await Product.countDocuments()
        const alluser = await user.countDocuments()
        const allReview = await Review.countDocuments()
        const allcategory= await Category.countDocuments()
const allPayment = await Payment.countDocuments({
  paymentStatus: "Success"
})

        res.status(200).json({
            message: 'Fetched all counts',
            allorder,allproduct,alluser,allReview,allcategory,allPayment
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server Error',
            error
        })
    }
}
