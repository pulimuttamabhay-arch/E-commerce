
import Order from '../Models/Order.js'
import Product from '../Models/Product.js'
import Cart from '../Models/Cart.js'
import Payment from '../Models/Payment.js'
import User from '../Models/user_model.js'
import Notification from '../Models/Notification.js'
import Razorpay from 'razorpay'
import { getIO } from '../socket.js'
// Place Order

const processOrderRefund = async (order, isApprovedReturn = false) => {
    const payment = await Payment.findOne({
        order: order._id,
        customer: order.customer
    }).sort({ createdAt: -1 })

    if (isApprovedReturn && payment?.paymentMethod === 'COD') {
        order.refundStatus = 'Manual processing'
        await order.save()
        return 'A manual COD refund is required'
    }

    if (order.paymentStatus !== 'Paid') {
        order.refundStatus = 'Not required'
        await order.save()
        return 'No prepaid refund is due'
    }

    if (payment?.paymentStatus === 'Refunded') {
        order.paymentStatus = 'Refunded'
        order.refundStatus = 'Refunded'
        await order.save()
        return 'Refund has already been processed'
    }

    if (
        !payment ||
        payment.paymentMethod === 'COD' ||
        payment.paymentStatus !== 'Success' ||
        !payment.razorpayPaymentId
    ) {
        order.refundStatus = 'Processing'
        await order.save()
        return 'Refund requires payment reconciliation'
    }

    const claimedPayment = await Payment.findOneAndUpdate(
        {
            _id: payment._id,
            paymentStatus: 'Success',
            razorpayRefundId: { $in: ['', null] }
        },
        { $set: { paymentStatus: 'Processing' } },
        { new: true }
    )

    if (!claimedPayment) {
        order.refundStatus = 'Processing'
        await order.save()
        return 'Refund is already being processed'
    }

    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay API keys are missing in backend .env')
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const refund = await razorpay.payments.refund(
            claimedPayment.razorpayPaymentId,
            { amount: Math.round(claimedPayment.amount * 100) }
        )

        claimedPayment.paymentStatus = 'Refunded'
        claimedPayment.razorpayRefundId = refund.id
        await claimedPayment.save()

        order.paymentStatus = 'Refunded'
        order.refundStatus = 'Refunded'
        await order.save()
        return 'Razorpay refund processed successfully'
    } catch (error) {
        console.error('Razorpay refund requires reconciliation:', error)
        order.refundStatus = 'Processing'
        await order.save()
        return 'Cancellation/return is recorded; refund is pending reconciliation'
    }
}

export const Addorder = async (req, res) => {
  const updatedProducts = []

  try {
    const { shippingAddress } = req.body

    // Check logged-in customer
    const customer = await User.findById(req.id)

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Customer not found. Please login again'
      })
    }

    // Get the logged-in user's cart
    const cart = await Cart.findOne({ customer: customer._id })
      .populate('items.product')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      })
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      })
    }

    let subtotal = 0
    const orderItems = []

    // Check and reduce stock for every product
    for (const item of cart.items) {
      const product = item.product
      const quantity = Number(item.quantity)

      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Invalid product or quantity in cart')
      }

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: product._id,
          stock: { $gte: quantity },
          isActive: true
        },
        {
          $inc: { stock: -quantity }
        },
        {
          new: true
        }
      )

      if (!updatedProduct) {
        throw new Error(
          `${product.name} is out of stock or has insufficient stock`
        )
      }

      updatedProducts.push({
        productId: product._id,
        quantity: quantity
      })

      const price = updatedProduct.price

      subtotal += price * quantity

      orderItems.push({
        product: updatedProduct._id,
        productName: updatedProduct.name,
        price: price,
        quantity: quantity,
        image: updatedProduct.image?.[0] || ''
      })
    }

    const deliveryCharge = subtotal >= 599 ? 0 : 50
    const totalAmount = subtotal + deliveryCharge

    // Create the order
    const newOrder = new Order({
      customer: customer._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      deliveryCharge,
      totalAmount,
      orderStatus: 'Placed'
    })

    await newOrder.save()

    console.log('Order saved successfully:', newOrder._id)
    console.log('Order customer ID:', newOrder.customer)

    // Get customer name from shipping address
    const customerName = [
      shippingAddress.fname,
      shippingAddress.lname
    ].filter(Boolean).join(' ') || customer.name

    // Save notification in MongoDB
    try {

      const notification = await Notification.create({
        message: 'A new order has been received',
        orderId: newOrder._id,
        customerName: customerName,
        amount: newOrder.totalAmount,
        isRead: false
      })

      console.log('NOTIFICATION SAVED:', notification)

      // Send real-time notification to Admin
      const io = getIO()

      console.log('Socket.IO available:', !!io)

      console.log(
        'Admin room sockets:',
        io?.sockets.adapter.rooms.get('admin')?.size || 0
      )

      if (io) {
        io.to('admin').emit('new-order', notification)
        console.log('New order notification emitted')
      }

    } catch (notificationError) {
      console.error('NOTIFICATION SAVE FAILED:')
      console.error(notificationError)
    }

    // Clear cart only after order is saved
    cart.items = []
    await cart.save()

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    })

  } catch (error) {

    // Restore stock if order creation fails
    for (const item of updatedProducts) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      ).catch(() => {})
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order'
    })
  }
}


// View All Orders (Admin)
export const Vieworder = async (req, res) => {
    try {
        const allorder = await Order.find()
            .populate('customer', 'name email phone')
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 })

        console.log('Fetched Orders', allorder)

        res.status(200).json({
            message: 'Fetched all orders',
            allorder
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server Error',
            error
        })
    }
}


// View Orders of Logged-in Customer
export const Myorders = async (req, res) => {
    try {
        const myorder = await Order.find({
            customer: req.id
        })
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 })

        console.log('Fetched Customer Orders', myorder)

        res.status(200).json({
            message: 'Fetched customer orders',
            myorder
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server Error',
            error
        })
    }
}


// View Single Order
export const Getorder = async (req, res) => {
    try {
        const { oid } = req.params

        const order = await Order.findById(oid)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name price')

        console.log('Order fetched by id', order)

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        res.status(200).json({
            message: 'Order found',
            order
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server Error',
            error
        })
    }
}


// Update Order Status (Admin)
export const Updateorderstatus = async (req, res) => {
    try {
        const { oid } = req.params
        const { orderStatus } = req.body

        const allowedStatus = [
            'Placed',
            'Confirmed',
            'Packed',
            'Shipped',
            'Out for Delivery',
            'Delivered',
            'Cancelled',
            'Returned'
        ]

        if (!allowedStatus.includes(orderStatus)) {
            return res.status(400).json({
                message: 'Invalid order status'
            })
        }

        if (orderStatus === 'Cancelled' || orderStatus === 'Returned') {
            return res.status(400).json({
                message: 'Use the customer cancellation or return review action'
            })
        }

        const uorder = await Order.findByIdAndUpdate(
            oid,
            { orderStatus },
            { new: true, runValidators: true }
        )

        console.log('Updated Order Status', uorder)

        if (!uorder) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        res.status(200).json({
            message: 'Updated Order Status',
            uorder
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server Error',
            error
        })
    }
}


// Update Payment Status
export const Updatepaymentstatus = async (req, res) => {
    try {
        const { oid } = req.params
        const { paymentStatus } = req.body

        const allowedStatus = [
            'Pending',
            'Paid',
            'Failed',
            'Refunded'
        ]

        if (!allowedStatus.includes(paymentStatus)) {
            return res.status(400).json({
                message: 'Invalid payment status'
            })
        }

        const upayment = await Order.findByIdAndUpdate(
            oid,
            { paymentStatus },
            { new: true, runValidators: true }
        )

        console.log('Updated Payment Status', upayment)

        if (!upayment) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        res.status(200).json({
            message: 'Updated Payment Status',
            upayment
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server Error',
            error
        })
    }
}


// Cancel Order (Customer); cancellation is only available before confirmation.
export const Cancelorder = async (req, res) => {
    try {
        const { oid } = req.params

        const corder = await Order.findOneAndUpdate(
            {
                _id: oid,
                customer: req.id,
                orderStatus: 'Placed'
            },
            { $set: { orderStatus: 'Cancelled' } },
            { new: true }
        )

        if (!corder) {
            const existingOrder = await Order.findOne({
                _id: oid,
                customer: req.id
            })

            return res.status(existingOrder ? 400 : 404).json({
                success: false,
                message: existingOrder
                    ? 'Only orders with Placed status can be cancelled'
                    : 'Order not found'
            })
        }

        let stockRestorationFailed = false
        try {
            await Product.bulkWrite(
                corder.items.map((item) => ({
                    updateOne: {
                        filter: { _id: item.product },
                        update: { $inc: { stock: item.quantity } }
                    }
                }))
            )
        } catch (stockError) {
            stockRestorationFailed = true
            console.error('Cancelled order stock restoration failed:', stockError)
        }

        const refundMessage = await processOrderRefund(corder)
        const stockMessage = stockRestorationFailed
            ? 'Inventory restoration failed and requires admin reconciliation'
            : ''

        return res.status(200).json({
            success: true,
            message: [
                'Order cancelled successfully.',
                `${refundMessage}.`,
                stockMessage
            ].filter(Boolean).join(' '),
            corder
        })

    } catch (error) {
        console.error('Order cancellation failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to cancel this order'
        })
    }
}

export const Requestreturn = async (req, res) => {
    try {
        const reason = typeof req.body.reason === 'string'
            ? req.body.reason.trim()
            : ''

        if (!reason || reason.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a return reason of up to 500 characters'
            })
        }

        const order = await Order.findOne({
            _id: req.params.oid,
            customer: req.id
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Only delivered orders can be returned'
            })
        }

        if (['Pending', 'Approved'].includes(order.returnRequest.status)) {
            return res.status(409).json({
                success: false,
                message: 'A return request already exists for this order'
            })
        }

        order.returnRequest = {
            status: 'Pending',
            reason,
            requestedAt: new Date(),
            reviewedAt: null
        }
        order.refundStatus = 'Pending review'
        await order.save()

        return res.status(201).json({
            success: true,
            message: 'Return request submitted for review',
            order
        })
    } catch (error) {
        console.error('Return request failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to submit the return request'
        })
    }
}

export const Reviewreturn = async (req, res) => {
    try {
        const { decision } = req.body

        if (!['approve', 'reject'].includes(decision)) {
            return res.status(400).json({
                success: false,
                message: 'Decision must be approve or reject'
            })
        }

        const approved = decision === 'approve'
        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.oid,
                orderStatus: 'Delivered',
                'returnRequest.status': 'Pending'
            },
            {
                $set: {
                    orderStatus: approved ? 'Returned' : 'Delivered',
                    'returnRequest.status': approved ? 'Approved' : 'Rejected',
                    'returnRequest.reviewedAt': new Date(),
                    refundStatus: approved ? 'Processing' : 'Not required'
                }
            },
            { new: true }
        )

        if (!order) {
            return res.status(409).json({
                success: false,
                message: 'No pending return request is available to review'
            })
        }

        const message = approved
            ? await processOrderRefund(order, true)
            : 'Return request rejected'

        return res.status(200).json({
            success: true,
            message,
            order
        })
    } catch (error) {
        console.error('Return review failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to review this return request'
        })
    }
}

export const CompleteManualRefund = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.oid,
            orderStatus: 'Returned',
            refundStatus: 'Manual processing'
        })

        if (!order) {
            return res.status(409).json({
                success: false,
                message: 'No manual refund is waiting to be completed'
            })
        }

        const payment = await Payment.findOne({
            order: order._id,
            customer: order.customer,
            paymentMethod: 'COD'
        }).sort({ createdAt: -1 })

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'COD payment record not found'
            })
        }

        payment.paymentStatus = 'Refunded'
        await payment.save()

        order.paymentStatus = 'Refunded'
        order.refundStatus = 'Refunded'
        await order.save()

        return res.status(200).json({
            success: true,
            message: 'Manual refund marked as completed',
            order
        })
    } catch (error) {
        console.error('Manual refund completion failed:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to complete the manual refund'
        })
    }
}
