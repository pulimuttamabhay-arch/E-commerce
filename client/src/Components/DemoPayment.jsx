import { host } from '../Context/Host.jsx'

import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function DemoPayment() {
  const location = useLocation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const checkout = location.state?.checkout

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString('en-IN')

  const completepayment = async (result) => {
    if (!checkout) {
      alert('Checkout details not found. Please try again.')
      navigate('/checkout')
      return
    }

    if (result === 'Failed') {
      alert('Demo payment failed. Your order has not been created.')
      return
    }

    const token = localStorage.getItem('Usertoken')

    if (!token) {
      alert('Please login first')
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      const axios = (await import('axios')).default

      const res = await axios.post(
        `${host}/payment/demo-checkout`,
        {
          items: checkout.items,
          shippingAddress: checkout.shippingAddress,
          totalAmount: checkout.totalAmount,
          paymentMethod: checkout.paymentMethod
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.data.success) {
        alert('Demo payment successful! Your order has been placed.')
        navigate('/myorders', {
          replace: true,
          state: {
            order: res.data.order,
            payment: res.data.payment
          }
        })
      } else {
        alert(res.data.message || 'Unable to complete payment')
      }
    } catch (error) {
      console.log(
        'Demo payment error:',
        error.response?.data || error.message
      )

      alert(error.response?.data?.message || 'Unable to complete demo payment')
    } finally {
      setLoading(false)
    }
  }

  if (!checkout) {
    return (
      <div className="container py-5">
        <h3>Checkout details not found</h3>
        <p>Please return to checkout and try again.</p>
        <button className="btn btn-brand" onClick={() => navigate('/checkout')}>
          Return to Checkout
        </button>
      </div>
    )
  }

  return (
    <div>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Demo payment</span>
          <h1 className="mt-2">Complete your payment</h1>
          <p>This is a test simulation. No real money will be charged.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="info-card p-4 p-lg-5">
                <h4>Payment Summary</h4>

                <div className="d-flex justify-content-between mt-4">
                  <span>Payment Method</span>
                  <strong>{checkout.paymentMethod}</strong>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <span>Order Amount</span>
                  <strong>₹{formatAmount(checkout.totalAmount)}</strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                  <strong>Total</strong>
                  <h3 className="cart-total mb-0">
                    ₹{formatAmount(checkout.totalAmount)}
                  </h3>
                </div>

                <div className="alert alert-warning mt-4">
                  Demo mode: these buttons simulate payment results. They do
                  not verify an actual UPI or card transaction.
                </div>

                <button
                  className="btn btn-brand w-100 mt-2"
                  disabled={loading}
                  onClick={() => completepayment('Paid')}
                >
                  {loading ? 'Processing...' : 'Simulate Successful Payment'}
                </button>

                <button
                  className="btn btn-outline-danger w-100 mt-3"
                  disabled={loading}
                  onClick={() => completepayment('Failed')}
                >
                  Simulate Failed Payment
                </button>

                <button
                  className="btn btn-light w-100 mt-3"
                  disabled={loading}
                  onClick={() => navigate('/checkout')}
                >
                  Back to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
