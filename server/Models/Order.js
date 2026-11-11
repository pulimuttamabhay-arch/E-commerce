
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        productName: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        image: {
          type: String,
          default: ''
        }
      }
    ],
    shippingAddress: {
      type: String,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    orderStatus: {
      type: String,
      enum: [
        'Placed',
        'Confirmed',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Returned'
      ],
      default: 'Placed'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    returnRequest: {
      status: {
        type: String,
        enum: ['None', 'Pending', 'Approved', 'Rejected'],
        default: 'None'
      },
      reason: {
        type: String,
        default: ''
      },
      requestedAt: {
        type: Date,
        default: null
      },
      reviewedAt: {
        type: Date,
        default: null
      }
    },
    refundStatus: {
      type: String,
      enum: [
        'Not required',
        'Pending review',
        'Processing',
        'Manual processing',
        'Refunded'
      ],
      default: 'Not required'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);