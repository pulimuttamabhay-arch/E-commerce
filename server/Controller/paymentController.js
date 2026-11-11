
import crypto from 'crypto';
import Razorpay from 'razorpay';

import Payment from '../Models/Payment.js';
import Order from '../Models/Order.js';
import Product from '../Models/Product.js';
import Cart from '../Models/Cart.js';
import Notification from '../Models/Notification.js';
import User from '../Models/user_model.js';
import { getIO } from '../socket.js';

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay API keys are missing in backend .env');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};


// Convert shipping address into a string.
const formatAddress = (address) => {
  if (typeof address === 'string') {
    return address.trim();
  }

  if (typeof address === 'object' && address !== null) {
    return Object.values(address)
      .filter(Boolean)
      .join(', ')
      .trim();
  }

  return '';
};


// Get cart details and calculate the amount using database prices.
const getCheckoutDetails = async (customerId, shippingAddress) => {
  const address = formatAddress(shippingAddress);

  if (!address) {
    throw new Error('Shipping address is required');
  }

  const cart = await Cart.findOne({
    customer: customerId
  }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new Error('Your cart is empty');
  }

  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    const quantity = Number(item.quantity);

    if (!product) {
      throw new Error('A product in your cart was not found');
    }

    if (product.isActive === false) {
      throw new Error(`${product.name} is currently unavailable`);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Invalid product quantity');
    }

    if (quantity > product.stock) {
      throw new Error(
        `${product.name} has only ${product.stock} items available`
      );
    }

    orderItems.push({
      product: product._id,
      productName: product.name,
      price: Number(product.price),
      quantity,
      image: Array.isArray(product.image)
        ? product.image[0] || ''
        : product.image || ''
    });
  }

  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryCharge = subtotal >= 599 ? 0 : 50;
  const totalAmount = subtotal + deliveryCharge;

  return {
    cart,
    orderItems,
    address,
    subtotal,
    deliveryCharge,
    totalAmount
  };
};


// Reduce product stock safely.
const reduceStock = async (items) => {
  const updatedProducts = [];

  try {
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
          isActive: true
        },
        {
          $inc: { stock: -item.quantity }
        },
        {
          new: true
        }
      );

      if (!product) {
        throw new Error(
          `${item.productName} is out of stock or has insufficient stock`
        );
      }

      updatedProducts.push(item);
    }

    return updatedProducts;

  } catch (error) {
    await restoreStock(updatedProducts);
    throw error;
  }
};


// Restore stock if order creation fails.
const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: { stock: item.quantity }
      }
    );
  }
};


// Create and send admin notification.
const sendOrderNotification = async (order, customerId) => {
  const customer = await User.findById(customerId);

  const notification = await Notification.create({
    message: 'A new order has been received',
    orderId: order._id,
    customerName: customer?.name || 'Customer',
    amount: order.totalAmount,
    isRead: false
  });

  const io = getIO();

  if (io) {
    io.to('admin').emit('new-order', notification);
  }

  return notification;
};


// COD checkout.
// Online payments must use Razorpay routes below.
export const demoCheckout = async (req, res) => {
  let savedOrder;
  let savedPayment;
  let checkout;
  let stockUpdated = false;

  try {
    const customerId = req.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }

    const { shippingAddress, paymentMethod } = req.body;

    if (paymentMethod !== 'COD') {
      return res.status(400).json({
        success: false,
        message: 'Online payments must use Razorpay checkout'
      });
    }

    checkout = await getCheckoutDetails(
      customerId,
      shippingAddress
    );

    await reduceStock(checkout.orderItems);
    stockUpdated = true;

    savedOrder = await Order.create({
      customer: customerId,
      items: checkout.orderItems,
      shippingAddress: checkout.address,
      totalAmount: checkout.totalAmount,
      orderStatus: 'Placed',
      paymentStatus: 'Pending'
    });

    savedPayment = await Payment.create({
      order: savedOrder._id,
      customer: customerId,
      amount: checkout.totalAmount,
      paymentMethod: 'COD',
      paymentStatus: 'Pending'
    });

    await sendOrderNotification(savedOrder, customerId);

    checkout.cart.items = [];
    await checkout.cart.save();

    return res.status(201).json({
      success: true,
      message: 'COD order placed successfully',
      order: savedOrder,
      payment: savedPayment
    });

  } catch (error) {
    console.error('COD checkout error:', error);

    if (savedPayment) {
      await Payment.findByIdAndDelete(savedPayment._id);
    }

    if (savedOrder) {
      await Notification.deleteOne({
        orderId: savedOrder._id
      });

      await Order.findByIdAndDelete(savedOrder._id);
    }

    if (stockUpdated && checkout) {
      await restoreStock(checkout.orderItems);
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'COD checkout failed'
    });
  }
};


// Create Razorpay order.

export const createRazorpayOrder = async (req, res) => {
  try {
    const customerId = req.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }

    const { shippingAddress, paymentMethod, phone } = req.body;

    const allowedMethods = ['UPI', 'Card', 'NetBanking'];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid online payment method'
      });
    }

    // Validate Indian mobile number
    const mobile = String(phone || '').replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    const checkout = await getCheckoutDetails(
      customerId,
      shippingAddress
    );

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(checkout.totalAmount * 100),
      currency: 'INR',
      receipt: `QuickSell-${Date.now()}`,
      notes: {
        customerId: String(customerId),
        customerPhone: mobile
      }
    });

    const payment = await Payment.create({
      customer: customerId,
      amount: checkout.totalAmount,
      paymentMethod,
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrder.id,
      items: checkout.orderItems,
      shippingAddress: checkout.address,
      deliveryCharge: checkout.deliveryCharge
    });

    return res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Create Razorpay order error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create payment order'
    });
  }
};


// Verify Razorpay payment and create the actual order.
export const verifyRazorpayPayment = async (req, res) => {
  let savedOrder;
  let payment;
  let razorpayPayment;
  let razorpay;
  let stockUpdated = false;
  let paymentClaimed = false;
  let paymentCaptured = false;

  try {
    const customerId = req.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are missing'
      });
    }

    payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      customer: customerId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Return the existing order if payment was already completed.
    if (payment.paymentStatus === 'Success' && payment.order) {
      const existingOrder = await Order.findById(payment.order);

      return res.status(200).json({
        success: true,
        message: 'Payment was already verified',
        order: existingOrder,
        payment
      });
    }

    if (payment.paymentStatus === 'Processing') {
      return res.status(409).json({
        success: false,
        message: 'Payment is already being processed'
      });
    }

    if (payment.paymentStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'This payment cannot be verified'
      });
    }

    // Verify Razorpay signature.
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret key is missing');
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const signatureBuffer = Buffer.from(generatedSignature, 'hex');
    const receivedBuffer = Buffer.from(razorpay_signature, 'hex');

    if (
      signatureBuffer.length !== receivedBuffer.length ||
      signatureBuffer.length === 0 ||
      !crypto.timingSafeEqual(signatureBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay payment signature'
      });
    }

    razorpay = getRazorpay();

    // Confirm payment status directly with Razorpay.
    razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.amount !== Math.round(payment.amount * 100) ||
      razorpayPayment.currency !== 'INR'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment details do not match'
      });
    }

    // Capture an authorized payment if automatic capture has not
    // already captured it.
    if (razorpayPayment.status === 'authorized') {
      razorpayPayment = await razorpay.payments.capture(
        razorpay_payment_id,
        razorpayPayment.amount,
        'INR'
      );
    }

    if (razorpayPayment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been captured successfully'
      });
    }

    paymentCaptured = true;

    // Claim this payment atomically to prevent duplicate orders.
    const claimedPayment = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        paymentStatus: 'Pending',
        order: null
      },
      {
        $set: {
          paymentStatus: 'Processing'
        }
      },
      {
        new: true
      }
    );

    if (!claimedPayment) {
      const latestPayment = await Payment.findById(payment._id);

      if (latestPayment?.paymentStatus === 'Success' && latestPayment.order) {
        const existingOrder = await Order.findById(latestPayment.order);

        return res.status(200).json({
          success: true,
          message: 'Payment was already verified',
          order: existingOrder,
          payment: latestPayment
        });
      }

      return res.status(409).json({
        success: false,
        message: 'Payment is already being processed'
      });
    }

    payment = claimedPayment;
    paymentClaimed = true;

    // Reduce stock using the saved payment items.
    await reduceStock(payment.items);
    stockUpdated = true;

    // Create the actual order.
    savedOrder = await Order.create({
      customer: customerId,
      items: payment.items,
      shippingAddress: payment.shippingAddress,
      totalAmount: payment.amount,
      orderStatus: 'Placed',
      paymentStatus: 'Paid'
    });

    // Update payment after order creation.
    payment.order = savedOrder._id;
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.transactionId = razorpay_payment_id;
    payment.paymentStatus = 'Success';
    payment.paidAt = new Date();

    await payment.save();

    await sendOrderNotification(savedOrder, customerId);

    // Clear cart only after successful verification and order creation.
    await Cart.findOneAndUpdate(
      { customer: customerId },
      { $set: { items: [] } }
    );

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order: savedOrder,
      payment
    });

  } catch (error) {
    console.error('Razorpay verification error:', error);

    // Remove the order if the payment workflow failed after order creation.
    if (savedOrder) {
      try {
        await Notification.deleteOne({
          orderId: savedOrder._id
        });

        await Order.findByIdAndDelete(savedOrder._id);
      } catch (cleanupError) {
        console.error('Order cleanup error:', cleanupError);
      }
    }

    // Restore stock if it was successfully reduced.
    if (stockUpdated && payment) {
      try {
        await restoreStock(payment.items);
      } catch (stockError) {
        console.error('Stock restoration error:', stockError);
      }
    }

    // A captured payment must not silently become Pending or Failed.
    // Attempt a refund if this request claimed the payment and
    // could not complete the order.
    if (paymentClaimed && paymentCaptured && payment && razorpay) {
      try {
        // Keep the record in Processing until the refund is confirmed.
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              order: null,
              paymentStatus: 'Processing'
            }
          }
        );

        const refund = await razorpay.payments.refund(
          payment.razorpayPaymentId || razorpayPayment.id,
          {
            amount: Math.round(payment.amount * 100)
          }
        );

        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              order: null,
              paymentStatus: 'Refunded',
              razorpayPaymentId: payment.razorpayPaymentId || razorpayPayment.id,
              transactionId: payment.razorpayPaymentId || razorpayPayment.id
            }
          }
        );

        console.log('Razorpay refund initiated:', refund.id);

      } catch (refundError) {
        console.error(
          'IMPORTANT: Razorpay refund failed. Manual reconciliation required:',
          refundError
        );

        // Leave the payment in Processing for manual reconciliation.
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              order: null,
              paymentStatus: 'Processing'
            }
          }
        );
      }
    } else if (paymentClaimed && payment) {
      // No captured payment: release the verification claim.
      await Payment.updateOne(
        {
          _id: payment._id,
          paymentStatus: 'Processing'
        },
        {
          $set: {
            paymentStatus: 'Pending'
          }
        }
      );
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};


// Create a pending payment record for an existing order.
export const createPayment = async (req, res) => {
  try {
    const customerId = req.id;
    const { orderId, paymentMethod } = req.body;

    const allowedMethods = ['COD', 'UPI', 'Card', 'NetBanking'];

    if (!customerId) {
      return res.status(401).json({
        message: 'Please login first'
      });
    }

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Invalid payment method'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: customerId
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        message: 'Cannot pay for a cancelled order'
      });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({
        message: 'Order is already paid'
      });
    }

    const payment = await Payment.create({
      order: order._id,
      customer: customerId,
      amount: order.totalAmount,
      paymentMethod,
      paymentStatus: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Payment record created',
      payment
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Customer: view own payment history.
export const getMyPayments = async (req, res) => {
  try {
    const customerId = req.id;

    const payments = await Payment.find({
      customer: customerId
    })
      .populate('order')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      allpayment: payments
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// Admin: view all payments.
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email')
      .populate({
        path: 'order',
        populate: {
          path: 'customer',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      allpayment: payments
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// Legacy endpoint. Do not mark an order paid without gateway verification.
export const confirmPayment = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Use the Razorpay payment verification endpoint'
  });
};
