
import Review from '../Models/Review.js';
import Order from '../Models/Order.js';
import Product from '../Models/Product.js';
import User from '../Models/user_model.js';
import Admin from '../Models/Admin_model.js'
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    // Check logged-in customer
    const customer = await User.findById(req.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Customer account not found. Please log in again.'
      });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check delivered order belongs to this customer
    const order = await Order.findOne({
      _id: orderId,
      customer: req.id,
      orderStatus: 'Delivered'
    });

    if (!order) {
      return res.status(400).json({
        message: 'Only delivered orders can be reviewed'
      });
    }

    // Check product exists in order
    const purchased = order.items.some(
      item => item.product.toString() === productId
    );

    if (!purchased) {
      return res.status(400).json({
        message: 'Product was not included in this order'
      });
    }

    // Save review
    const review = await Review.create({
      customer: customer._id,
      product: productId,
      order: orderId,
      rating,
      comment
    });

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });

  } catch (error) {
    console.log('Create Review Error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already reviewed this product for this order'
      });
    }

    res.status(500).json({
      message: error.message
    });
  }
};

async function updateProductRating(productId) {
  const result = await Review.aggregate([
    {
      $match: {
        product: (await import('mongoose')).default
          .Types.ObjectId.createFromHexString(productId),
        isVisible: true
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const stats = result[0] || {
    averageRating: 0,
    totalReviews: 0
  };

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(stats.averageRating.toFixed(1)),
    totalReviews: stats.totalReviews
  });
}

// Public: view visible reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
            isVisible: true
        })
            .populate('customer', 'name profileimage')
            .sort({ createdAt: -1 })

        res.json(reviews)
    } catch (error) {
        console.log('Get reviews error:', error)
        res.status(500).json({ message: error.message })
    }
}

// Admin: view all reviews, including hidden reviews
// Admin: view all reviews, including hidden reviews
// Admin: view all reviews, including hidden reviews
export const getAllReviews = async (req, res) => {
  try {
    const order = await Order.findById(
  '6ae82d92aa6c18835d5575ce'
).lean();

console.log('Order ID:', order?._id);
console.log('Order customer ID:', order?.customer);

const customer = await User.findById(order?.customer);

console.log('Matching customer:', customer);

    const reviews = await Review.find()
      .populate('customer', 'name email profileimage')
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);

  } catch (error) {
    console.log('Get all reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: hide or show a review
export const updateReviewVisibility = async (req, res) => {
  try {
    const { isVisible } = req.body;

    if (typeof isVisible !== 'boolean') {
      return res.status(400).json({
        message: 'isVisible must be true or false'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { isVisible } },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    await updateProductRating(review.product.toString());

    res.json({
      message: 'Review visibility updated',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};