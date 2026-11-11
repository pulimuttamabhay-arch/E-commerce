import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'Card', 'NetBanking'],
      required: true
    },
    transactionId: {
      type: String,
      default: ''
    },
    razorpayOrderId: {
  type: String,
  unique: true,
  sparse: true
},
    razorpayPaymentId: {
      type: String,
      default: ''
    },
    razorpaySignature: {
      type: String,
      default: ''
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        productName: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],
    shippingAddress: {
      type: String,
      default: ''
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
   paymentStatus: {
  type: String,
  enum: [
    'Pending',
    'Processing',
    'Success',
    'Failed',
    'Refunded'
  ],
  default: 'Pending'
},
razorpayRefundId: {
  type: String,
  default: ''
},
    paidAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);