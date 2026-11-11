
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const loadRazorpay = () => {
  return new Promise((resolve) => {

    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')

    script.src = 'https://checkout.razorpay.com/v1/checkout.js'

    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.body.appendChild(script)
  })
}

export default function Checkout() {

  const navigate = useNavigate()

  const [shipping, setShipping] = useState({
    fname: '',
    lname: '',
    address: '',
    city: '',
    pincode: '',
    phone: ''
  })

  const [payment, setPayment] = useState('Cash on delivery')
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    const getcart = async () => {

      try {

        const token = localStorage.getItem('Usertoken')

        if (!token) {
          alert('Please login first')
          navigate('/login')
          return
        }

        const res = await axios.get(
          'http://localhost:7002/cart/viewcart',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        console.log('Checkout cart:', res.data)

        setCart(res.data.items || [])

      } catch (error) {

        console.log(
          'Checkout cart error:',
          error.response?.data || error.message
        )

      }
    }

    getcart()

  }, [navigate])

  const totalAmount = cart.reduce((total, item) => {

    const price = Number(item.product?.price || item.price || 0)
    const quantity = Number(item.quantity || 1)

    return total + price * quantity

  }, 0)

  const deliveryCharge =
    totalAmount >= 599 || totalAmount === 0 ? 0 : 50

  const grandTotal = totalAmount + deliveryCharge

  const handlechange = (e) => {

    const { name, value } = e.target

    if (name === 'phone') {

      const phone = value.replace(/\D/g, '').slice(0, 10)

      setShipping({
        ...shipping,
        phone
      })

      return
    }

    if (name === 'pincode') {

      const pincode = value.replace(/\D/g, '').slice(0, 6)

      setShipping({
        ...shipping,
        pincode
      })

      return
    }

    setShipping({
      ...shipping,
      [name]: value
    })

  }

  const placeorder = async () => {

    if (loading) return

    if (
      !shipping.fname.trim() ||
      !shipping.lname.trim() ||
      !shipping.address.trim() ||
      !shipping.city.trim() ||
      !shipping.pincode.trim() ||
      !shipping.phone.trim()
    ) {

      alert('Please fill all shipping details')
      return

    }

    if (!/^\d{6}$/.test(shipping.pincode.trim())) {

      alert('Please enter a valid 6-digit PIN code')
      return

    }

    const phone = shipping.phone.trim()

    if (!/^[6-9]\d{9}$/.test(phone)) {

      alert('Please enter a valid 10-digit Indian mobile number')
      return

    }

    if (cart.length === 0) {

      alert('Your cart is empty')
      return

    }

    const token = localStorage.getItem('Usertoken')

    if (!token) {

      alert('Please login first')
      navigate('/login')
      return

    }

    const shippingAddress =
      `${shipping.fname} ${shipping.lname}, ${shipping.address}, ${shipping.city}, ${shipping.pincode}, Phone: ${phone}`

    setLoading(true)

    try {

      // CASH ON DELIVERY

      if (payment === 'Cash on delivery') {

        const res = await axios.post(
          'http://localhost:7002/payment/demo-checkout',
          {
            shippingAddress,
            paymentMethod: 'COD'
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (res.data.success) {

          setCart([])

          alert('COD order placed successfully')

          navigate('/myorders', {
            replace: true,
            state: {
              order: res.data.order,
              payment: res.data.payment
            }
          })

        } else {

          alert(res.data.message || 'Error placing order')

        }

        return
      }

      // LOAD RAZORPAY SCRIPT

      const loaded = await loadRazorpay()

      if (!loaded) {

        alert('Razorpay SDK failed to load. Check your internet connection.')
        return

      }

      // CREATE RAZORPAY ORDER

      const orderResponse = await axios.post(
        'http://localhost:7002/payment/create-razorpay-order',
        {
          shippingAddress,
          paymentMethod: payment,
          phone: phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!orderResponse.data.success) {

        alert(
          orderResponse.data.message ||
          'Unable to create payment order'
        )

        return

      }

      const razorpayOrder = orderResponse.data

      // RAZORPAY OPTIONS

      console.log('Entered phone:', phone)
      console.log('Phone length:', phone.length)
      console.log('Razorpay contact:', `+91${phone}`)

      const options = {

        key: razorpayOrder.keyId,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: 'QuickSell',

        description: 'Order Payment',

        order_id: razorpayOrder.razorpayOrderId,

        prefill: {

          name: `${shipping.fname} ${shipping.lname}`

        },

        handler: async function (response) {

          try {

            // VERIFY PAYMENT

            const verifyResponse = await axios.post(
              'http://localhost:7002/payment/verify-razorpay-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )

            if (verifyResponse.data.success) {

              setCart([])

              alert('Payment successful! Your order has been placed.')

              navigate('/myorders', {
                replace: true,
                state: {
                  order: verifyResponse.data.order,
                  payment: verifyResponse.data.payment
                }
              })

            } else {

              alert(
                verifyResponse.data.message ||
                'Payment verification failed'
              )

            }

          } catch (error) {

            console.log(
              'Payment verification error:',
              error.response?.data || error.message
            )

            alert(
              error.response?.data?.message ||
              'Payment verification failed. Please contact support before retrying.'
            )

          }

        },

        modal: {

          ondismiss: function () {

            alert('Payment cancelled. You can try again.')

          }

        },

        theme: {
          color: '#ff5a36'
        }

      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', function (response) {

        console.log('Razorpay payment failed:', response.error)

        alert(
          response.error.description ||
          'Payment failed. Please try again.'
        )

      })

      razorpay.open()

    } catch (error) {

      console.log(
        'Place order error:',
        error.response?.data || error.message
      )

      alert(
        error.response?.data?.message ||
        'Error placing order'
      )

    } finally {

      setLoading(false)

    }

  }

  return (

    <div>

      <section className="checkout-hero">
        <div className="container">

          <span className="checkout-eyebrow">
            <i className="bi bi-shield-lock-fill"></i>
            SECURE CHECKOUT
          </span>

          <h1>
            Complete your <span>order.</span>
          </h1>

          <p>
            Just a few more details and your favourite products will be on their way.
          </p>

          <div className="checkout-steps">

            <div className="checkout-step completed">
              <span><i className="bi bi-check-lg"></i></span>
              <small>Shopping Cart</small>
            </div>

            <div className="checkout-step active">
              <span>2</span>
              <small>Checkout</small>
            </div>

            <div className="checkout-step">
              <span>3</span>
              <small>Confirmation</small>
            </div>

          </div>

        </div>

        <div className="checkout-hero-circle"></div>
        <div className="checkout-hero-circle second"></div>

      </section>

      <section className="section checkout-section">
        <div className="container">

          <div className="checkout-page-heading">
            <div>
              <span className="eyebrow">ALMOST THERE</span>
              <h2>Checkout <span>& Payment</span></h2>
              <p>Enter your delivery details and choose how you'd like to pay.</p>
            </div>
          </div>

          <div className="row g-4">

            <div className="col-lg-7">

              <div className="checkout-form-card">

                <div className="checkout-card-heading">
                  <div className="checkout-heading-icon">
                    <i className="bi bi-geo-alt"></i>
                  </div>

                  <div>
                    <h4>Shipping details</h4>
                    <p>Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-6">

                    <label className="form-label">
                      First name
                    </label>

                    <div className="checkout-input-group">
                      <i className="bi bi-person"></i>

                      <input
                        type="text"
                        className="form-control"
                        name="fname"
                        value={shipping.fname}
                        onChange={handlechange}
                        placeholder="Enter first name"
                      />
                    </div>

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      Last name
                    </label>

                    <div className="checkout-input-group">
                      <i className="bi bi-person"></i>

                      <input
                        type="text"
                        className="form-control"
                        name="lname"
                        value={shipping.lname}
                        onChange={handlechange}
                        placeholder="Enter last name"
                      />
                    </div>

                  </div>

                  <div className="col-12">

                    <label className="form-label">
                      Address
                    </label>

                    <div className="checkout-input-group">
                      <i className="bi bi-house"></i>

                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={shipping.address}
                        onChange={handlechange}
                        placeholder="House number, street, area"
                      />
                    </div>

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      City
                    </label>

                    <div className="checkout-input-group">
                      <i className="bi bi-buildings"></i>

                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={shipping.city}
                        onChange={handlechange}
                        placeholder="Enter your city"
                      />
                    </div>

                  </div>

                  <div className="col-md-6">

                    <label className="form-label">
                      PIN code
                    </label>

                    <div className="checkout-input-group">
                      <i className="bi bi-mailbox"></i>

                      <input
                        type="text"
                        className="form-control"
                        name="pincode"
                        value={shipping.pincode}
                        onChange={handlechange}
                        placeholder="6-digit PIN code"
                        maxLength="6"
                      />
                    </div>

                  </div>

                  <div className="col-12">

                    <label className="form-label">
                      Mobile number
                    </label>

                    <div className="input-group checkout-phone-group">

                      <span className="input-group-text">
                        <i className="bi bi-telephone"></i>
                        +91
                      </span>

                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={shipping.phone}
                        maxLength={10}
                        onChange={handlechange}
                        placeholder="Enter 10 digit mobile number"
                        required
                      />

                    </div>

                    <small className="checkout-helper-text">
                      <i className="bi bi-info-circle"></i>
                      Enter your 10-digit Indian mobile number.
                    </small>

                  </div>

                </div>

                <div className="checkout-divider"></div>

                <div className="checkout-card-heading">
                  <div className="checkout-heading-icon">
                    <i className="bi bi-credit-card"></i>
                  </div>

                  <div>
                    <h4>Payment method</h4>
                    <p>Choose your preferred payment option.</p>
                  </div>
                </div>

                <div className="checkout-payment-select">

                  <select
                    className="form-select"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    disabled={loading}
                  >

                    <option value="Cash on delivery">
                      Cash on Delivery
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Card">
                      Credit / Debit Card
                    </option>

                    <option value="NetBanking">
                      Net Banking
                    </option>

                  </select>

                </div>

                {payment === 'Cash on delivery' && (

                  <div className="checkout-payment-info cod">
                    <i className="bi bi-cash-coin"></i>

                    <div>
                      <h6>Pay when your order arrives</h6>
                      <p>You can pay the delivery partner when your order is delivered.</p>
                    </div>
                  </div>

                )}

                {payment === 'UPI' && (

                  <div className="checkout-payment-info">
                    <i className="bi bi-phone"></i>

                    <div>
                      <h6>Pay using UPI</h6>
                      <p>Complete your payment securely through Razorpay.</p>
                    </div>
                  </div>

                )}

                {payment === 'Card' && (

                  <div className="checkout-payment-info">
                    <i className="bi bi-credit-card-2-front"></i>

                    <div>
                      <h6>Credit / Debit Card</h6>
                      <p>Complete your card payment securely through Razorpay.</p>
                    </div>
                  </div>

                )}

                {payment === 'NetBanking' && (

                  <div className="checkout-payment-info">
                    <i className="bi bi-bank"></i>

                    <div>
                      <h6>Net Banking</h6>
                      <p>Complete your payment securely through Razorpay.</p>
                    </div>
                  </div>

                )}

                <button
                  className="checkout-place-order-btn"
                  onClick={placeorder}
                  disabled={loading}
                >

                  {loading
                    ? 'Processing your order...'
                    : payment === 'Cash on delivery'
                      ? 'Place Order'
                      : 'Pay Now'}

                  <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-arrow-right'}`}></i>

                </button>

                <div className="checkout-secure-note">
                  <i className="bi bi-shield-lock-fill"></i>
                  Your information is protected with secure checkout.
                </div>

              </div>

            </div>

            <div className="col-lg-5">

              <div className="checkout-summary-card">

                <div className="checkout-summary-heading">
                  <div>
                    <span>QUICKSELL</span>
                    <h4>Order Summary</h4>
                  </div>

                  <div className="checkout-summary-icon">
                    <i className="bi bi-receipt"></i>
                  </div>
                </div>

                <div className="checkout-summary-product-heading">
                  <span>Your items ({cart.length})</span>
                  <span>Price</span>
                </div>

                <div className="checkout-summary-products">

                  {cart.map((item, index) => {

                    const product = item.product || item

                    return (

                      <div
                        key={product._id || index}
                        className="checkout-summary-product"
                      >

                        <div className="checkout-summary-product-info">
                          <div className="checkout-product-icon">
                            <i className="bi bi-box-seam"></i>
                          </div>

                          <div>
                            <h6>
                              {product.name || item.productName}
                            </h6>

                            <small>
                              Quantity: {item.quantity || 1}
                            </small>
                          </div>
                        </div>

                        <b>
                          ₹{(
                            Number(product.price || item.price || 0) *
                            Number(item.quantity || 1)
                          ).toLocaleString('en-IN')}
                        </b>

                      </div>

                    )

                  })}

                  {cart.length === 0 && (

                    <p className="checkout-empty-cart">
                      <i className="bi bi-bag"></i>
                      Your cart is empty.
                    </p>

                  )}

                </div>

                <div className="checkout-summary-calculation">

                  <div className="d-flex justify-content-between">
                    <span>Subtotal</span>

                    <b>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </b>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span>Delivery charge</span>

                    <b className={deliveryCharge === 0 ? 'text-success' : ''}>
                      {deliveryCharge === 0
                        ? 'FREE'
                        : `₹${deliveryCharge.toLocaleString('en-IN')}`}
                    </b>
                  </div>

                </div>

                {totalAmount > 0 && totalAmount < 599 && (

                  <div className="checkout-free-delivery">
                    <p>
                      Add <b>₹{(599 - totalAmount).toLocaleString('en-IN')}</b> more for free delivery!
                    </p>

                    <div className="checkout-progress-track">
                      <div
                        className="checkout-progress-fill"
                        style={{ width: `${Math.min((totalAmount / 599) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                )}

                {deliveryCharge === 0 && totalAmount > 0 && (

                  <div className="checkout-free-delivery-success">
                    <i className="bi bi-check-circle-fill"></i>
                    You've unlocked free delivery!
                  </div>

                )}

                <div className="checkout-grand-total">
                  <div>
                    <span>Grand Total</span>
                    <small>Inclusive of delivery charges</small>
                  </div>

                  <h2>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </h2>
                </div>

                <div className="checkout-summary-footer">
                  <div>
                    <i className="bi bi-shield-check"></i>
                    <span>Secure Payment</span>
                  </div>

                  <div>
                    <i className="bi bi-truck"></i>
                    <span>Safe Delivery</span>
                  </div>
                </div>

                <div className="checkout-razorpay-note">
                  <i className="bi bi-lock-fill"></i>
                  Secure online payments powered by Razorpay Test Mode.
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

    </div>

  )

}
