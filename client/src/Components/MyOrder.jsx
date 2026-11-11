import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [returnTarget, setReturnTarget] = useState(null)
  const [returnReason, setReturnReason] = useState('')
  const [returnLoading, setReturnLoading] = useState(false)
  const [orderActionLoading, setOrderActionLoading] = useState(null)

  const fetchorders = async () => {
    try {
      const token = localStorage.getItem('Usertoken')

      if (!token) {
        alert('Please login first')
        return
      }

      const res = await axios.get(
        'http://localhost:7002/order/myorders',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setOrders(res.data.myorder || [])
    } catch (error) {
      console.log(
        'Fetch orders error:',
        error.response?.data || error.message
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchorders()
  }, [])

  const handleAddReview = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('Usertoken')

      if (!token) {
        alert('Please login first')
        return
      }

      if (!reviewTarget) {
        alert('Please select a product to review')
        return
      }

      if (!reviewText.trim()) {
        alert('Please write your review')
        return
      }

      setReviewLoading(true)

      const res = await axios.post(
        'http://localhost:7002/review/addreview',
        {
          productId: reviewTarget.productId,
          orderId: reviewTarget.orderId,
          rating: Number(rating),
          comment: reviewText.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert(res.data.message || 'Review submitted successfully')

      setReviewTarget(null)
      setRating(5)
      setReviewText('')

    } catch (error) {
      console.log(
        'Review submit error:',
        error.response?.data || error
      )

      alert(
        error.response?.data?.message ||
        'Unable to submit review'
      )
    } finally {
      setReviewLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? This action cannot be undone.')) return

    try {
      setOrderActionLoading(orderId)
      const token = localStorage.getItem('Usertoken')
      const res = await axios.put(
        `http://localhost:7002/order/cancelorder/${orderId}`,
        {},
        { headers: { Authorization: 'Bearer ' + token } }
      )

      alert(res.data.message || 'Order cancelled')
      await fetchorders()
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to cancel this order')
    } finally {
      setOrderActionLoading(null)
    }
  }

  const handleReturnRequest = async (e) => {
    e.preventDefault()
    if (!returnTarget) return

    try {
      setReturnLoading(true)
      const token = localStorage.getItem('Usertoken')
      const res = await axios.post(
        `http://localhost:7002/order/returnrequest/${returnTarget}`,
        { reason: returnReason },
        { headers: { Authorization: 'Bearer ' + token } }
      )

      alert(res.data.message || 'Return request submitted')
      setReturnTarget(null)
      setReturnReason('')
      await fetchorders()
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to submit the return request')
    } finally {
      setReturnLoading(false)
    }
  }

  const getstatusclass = (status) => {
    if (status === 'Delivered') return 'order-status delivered'
    if (status === 'Cancelled' || status === 'Returned') return 'order-status cancelled'
    if (status === 'Shipped' || status === 'Out for Delivery') return 'order-status shipped'
    if (status === 'Confirmed' || status === 'Packed') return 'order-status confirmed'
    return 'order-status placed'
  }

  const steps = [
    'Placed',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ]

  const getprogress = (status) => {
    if (status === 'Cancelled' || status === 'Returned') return -1
    return steps.indexOf(status)
  }

  const getProductImage = (image) => {
    if (!image) return '/assets/img/product-1.png'

    if (Array.isArray(image)) {
      return getProductImage(image[0])
    }

    if (typeof image === 'string' && image.startsWith('http')) {
      return image
    }

    return `http://localhost:7002/image/${image}`
  }

  const getProductId = (item) => {
    if (!item) return null
    if (typeof item.product === 'object' && item.product !== null) {
      return item.product._id || item.productId || null
    }
    return item.productId || item.product || null
  }

  const activeOrders = orders.filter(
    (order) => !['Delivered', 'Cancelled', 'Returned'].includes(order.orderStatus)
  ).length
  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === 'Delivered'
  ).length

  return (
    <div className="my-orders-page">
      <style>{`
        .my-orders-page {
          min-height: 100vh;
          background: #f6f8fc;
          padding-bottom: 60px;
          color: #182230;
        }

        .orders-hero {
          background: linear-gradient(125deg, #172554, #2349a4);
          color: white;
          padding: 48px 0 70px;
        }

        .orders-hero p {
          color: #dbeafe;
        }

        .orders-count {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 15px;
          border: 1px solid #ffffff40;
          background: #ffffff15;
          border-radius: 30px;
          font-size: 14px;
        }

        .orders-content {
          margin-top: -32px;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .order-card {
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 6px 24px #17255408;
          transition: transform .25s ease, box-shadow .25s ease;
          animation: fadeSlideUp .45s ease both;
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px #17255414;
        }

        .order-card-header {
          padding: 22px 24px;
          background: #fcfdff;
          border-bottom: 1px solid #edf0f5;
        }

        .order-label {
          color: #778196;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .order-id {
          font-weight: 750;
          font-size: 18px;
          margin-top: 5px;
        }

        .order-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .order-status:before {
          content: '';
          height: 7px;
          width: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .delivered {
          color: #16803d;
          background: #e8f8ee;
        }

        .cancelled {
          color: #c52c36;
          background: #fff0f0;
        }

        .shipped {
          color: #1767c0;
          background: #eaf3ff;
        }

        .confirmed {
          color: #8054c7;
          background: #f2ecff;
        }

        .placed {
          color: #a46508;
          background: #fff5dd;
        }

        .order-card-body {
          padding: 24px;
        }

        .order-product {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #eef2f7;
        }

        .order-product:last-child {
          border-bottom: none;
        }

        .order-product-main {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .order-product-thumb {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(135deg, #eef4ff, #f7f3ff);
          border: 1px solid #dfe9ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform .25s ease, box-shadow .25s ease;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
        }

        .order-product-thumb:hover {
          transform: scale(1.06) rotate(-2deg);
          box-shadow: 0 12px 22px rgba(37, 99, 235, 0.18);
        }

        .order-product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .product-name {
          font-weight: 700;
          font-size: 14px;
          color: #182230;
        }

        .product-meta {
          color: #7b8495;
          font-size: 13px;
          margin-top: 5px;
        }

        .product-price {
          font-weight: 800;
          white-space: nowrap;
          color: #1f2937;
        }

        .order-progress {
          display: flex;
          align-items: flex-start;
          margin: 28px 0 8px;
        }

        .progress-step {
          flex: 1;
          position: relative;
          text-align: center;
          min-width: 0;
        }

        .progress-step:not(:last-child):after {
          content: '';
          position: absolute;
          top: 12px;
          left: calc(50% + 14px);
          width: calc(100% - 28px);
          height: 3px;
          background: #e5e9f1;
        }

        .progress-step.complete:not(:last-child):after {
          background: #2563eb;
        }

        .progress-dot {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          background: #e8edf5;
          color: #7c8799;
          font-size: 12px;
          font-weight: 800;
          position: relative;
          z-index: 1;
        }

        .progress-step.complete .progress-dot {
          color: white;
          background: #2563eb;
        }

        .progress-label {
          color: #8b95a6;
          font-size: 10px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .progress-step.complete .progress-label {
          color: #24324b;
          font-weight: 650;
        }

        .order-total-box {
          background: #f7f9fd;
          border-radius: 12px;
          padding: 17px 18px;
        }

        .order-total {
          color: #1d4ed8;
          font-size: 23px;
          font-weight: 800;
        }

        .empty-orders {
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 20px;
          padding: 55px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 76px;
          height: 76px;
          margin: 0 auto 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #edf3ff;
          color: #2456c7;
          border-radius: 24px;
          font-size: 34px;
        }

        .review-form {
          background: #f8faff;
          border: 1px solid #e4eaf5;
          border-radius: 14px;
          padding: 20px;
          margin-top: 12px;
        }

        .review-star {
          font-size: 30px;
          line-height: 1;
          border: none;
          background: transparent;
          padding: 0;
        }

        @media (max-width: 575px) {
          .orders-hero {
            padding: 35px 0 55px;
          }

          .order-card-header,
          .order-card-body {
            padding: 17px;
          }

          .progress-label {
            font-size: 9px;
          }

          .order-total {
            font-size: 20px;
          }

          .order-product {
            flex-wrap: wrap;
          }
        }

        .my-orders-page {
          --orders-ink: #172033;
          --orders-muted: #788397;
          --orders-brand: #ff6848;
          --orders-line: #e9edf3;
          background:
            radial-gradient(ellipse at 12% 35%, rgba(255, 104, 72, .045), transparent 28%),
            #f6f7fb;
          color: var(--orders-ink);
          padding-bottom: 84px;
        }

        .orders-hero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: 70px 0 100px;
          background:
            radial-gradient(ellipse at 85% 20%, rgba(255, 104, 72, .22), transparent 30%),
            linear-gradient(122deg, #121b2c 0%, #1c2b43 58%, #283954 100%);
        }

        .orders-hero::before,
        .orders-hero::after {
          position: absolute;
          z-index: -1;
          content: '';
          border: 1px solid rgba(255, 255, 255, .09);
          border-radius: 50%;
          pointer-events: none;
        }

        .orders-hero::before {
          width: 470px;
          height: 470px;
          top: -290px;
          right: 7%;
          box-shadow: 0 0 0 42px rgba(255, 255, 255, .025), 0 0 0 84px rgba(255, 255, 255, .02);
          animation: orders-orbit 18s linear infinite;
        }

        .orders-hero::after {
          width: 310px;
          height: 310px;
          right: 33%;
          bottom: -260px;
          border-color: rgba(255, 104, 72, .22);
        }

        .orders-hero .container {
          position: relative;
          z-index: 1;
        }

        .orders-hero-copy {
          animation: orders-rise .7s cubic-bezier(.2, .75, .25, 1) both;
        }

        .orders-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #ffb49f;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .orders-kicker i {
          display: grid;
          width: 30px;
          height: 30px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, .18);
          border-radius: 10px;
          background: rgba(255, 255, 255, .08);
          color: #ffd2c6;
          font-size: 14px;
        }

        .orders-hero h1 {
          margin: 22px 0 12px !important;
          color: #fff;
          font-size: clamp(2.5rem, 5vw, 4.15rem);
          font-weight: 800;
          letter-spacing: -.065em;
          line-height: 1.05;
        }

        .orders-hero p {
          max-width: 500px;
          color: #c5ceda;
          font-size: 15px;
          line-height: 1.8;
        }

        .orders-count {
          margin-top: 12px;
          padding: 9px 14px;
          border: 1px solid rgba(255, 255, 255, .16);
          background: rgba(255, 255, 255, .08);
          color: #fff;
          backdrop-filter: blur(12px);
        }

        .orders-count i {
          color: #ffab92;
        }

        .orders-hero-art {
          position: relative;
          width: min(100%, 340px);
          min-height: 190px;
          margin: 16px 0 0 auto;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, .17);
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(255, 255, 255, .15), rgba(255, 255, 255, .055));
          box-shadow: 0 25px 70px rgba(0, 0, 0, .2);
          backdrop-filter: blur(14px);
          animation: orders-float 5s ease-in-out infinite;
        }

        .orders-hero-art::before {
          position: absolute;
          top: -15px;
          right: 30px;
          width: 62px;
          height: 62px;
          border: 1px solid rgba(255, 255, 255, .18);
          border-radius: 20px;
          background: rgba(255, 104, 72, .82);
          content: '';
          transform: rotate(12deg);
          box-shadow: 0 12px 30px rgba(255, 104, 72, .25);
        }

        .orders-art-icon {
          display: grid;
          width: 66px;
          height: 66px;
          margin-bottom: 20px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, .22);
          border-radius: 20px;
          background: rgba(255, 255, 255, .1);
          color: white;
          font-size: 28px;
          transform: rotate(-6deg);
        }

        .orders-hero-art strong,
        .orders-hero-art span {
          display: block;
        }

        .orders-hero-art strong {
          color: #fff;
          font-size: 18px;
          font-weight: 750;
        }

        .orders-hero-art span {
          margin-top: 4px;
          color: #c5ceda;
          font-size: 12px;
        }

        .orders-content {
          position: relative;
          margin-top: -40px;
        }

        .orders-summary {
          margin-bottom: 24px;
        }

        .orders-summary-card {
          display: flex;
          min-height: 104px;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          border: 1px solid rgba(231, 235, 242, .85);
          border-radius: 18px;
          background: rgba(255, 255, 255, .93);
          box-shadow: 0 12px 32px rgba(23, 32, 51, .055);
          animation: orders-rise .55s both;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .orders-summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(23, 32, 51, .09);
        }

        .orders-summary-card:nth-child(2) { animation-delay: .08s; }
        .orders-summary-card:nth-child(3) { animation-delay: .16s; }

        .orders-summary-icon {
          display: grid;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          place-items: center;
          border-radius: 14px;
          background: #fff0eb;
          color: var(--orders-brand);
          font-size: 18px;
        }

        .orders-summary-card:nth-child(2) .orders-summary-icon {
          background: #edf3ff;
          color: #4671c6;
        }

        .orders-summary-card:nth-child(3) .orders-summary-icon {
          background: #eaf8f0;
          color: #258054;
        }

        .orders-summary-label {
          color: var(--orders-muted);
          font-size: 12px;
          font-weight: 650;
        }

        .orders-summary-value {
          margin-top: 2px;
          color: var(--orders-ink);
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -.04em;
          line-height: 1.2;
        }

        .order-card {
          border: 1px solid var(--orders-line);
          border-radius: 22px;
          box-shadow: 0 10px 32px rgba(23, 32, 51, .055);
          animation: orders-rise .6s cubic-bezier(.2, .75, .25, 1) both;
          transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
        }

        .order-card:nth-child(2) { animation-delay: .08s; }
        .order-card:nth-child(3) { animation-delay: .16s; }
        .order-card:nth-child(4) { animation-delay: .24s; }
        .order-card:nth-child(n + 5) { animation-delay: .3s; }

        .order-card:hover {
          border-color: #e3dcd9;
          transform: translateY(-5px);
          box-shadow: 0 22px 48px rgba(23, 32, 51, .09);
        }

        .order-card-header {
          padding: 22px 26px;
          background: linear-gradient(110deg, #fff, #fcfcfd);
        }

        .order-label {
          color: #8a94a5;
          font-size: 10px;
          letter-spacing: 1.35px;
        }

        .order-id {
          color: #172033;
          font-size: 19px;
          letter-spacing: -.035em;
        }

        .order-status {
          padding: 9px 13px;
          border: 1px solid currentColor;
          border-color: color-mix(in srgb, currentColor 14%, transparent);
          font-size: 11px;
          letter-spacing: .15px;
          transition: transform .2s ease;
        }

        .order-status:hover {
          transform: scale(1.035);
        }

        .order-card-body {
          padding: 23px 26px 26px;
        }

        .order-card-body > .d-flex h6,
        .order-card-body > h6 {
          color: #222d40;
          letter-spacing: -.2px;
        }

        .order-product {
          padding: 15px 0;
          border-color: #f0f2f6;
          transition: padding .2s ease;
        }

        .order-product-thumb {
          width: 70px;
          height: 70px;
          border: 1px solid #ebeef3;
          border-radius: 17px;
          background: linear-gradient(145deg, #f8f6f4, #f1f4f8);
          box-shadow: none;
          transition: transform .28s ease, box-shadow .28s ease;
        }

        .order-product-thumb:hover {
          transform: scale(1.06) rotate(-2deg);
          box-shadow: 0 12px 24px rgba(23, 32, 51, .12);
        }

        .order-product-thumb img {
          object-fit: contain;
          padding: 5px;
          mix-blend-mode: multiply;
        }

        .product-name {
          color: #1c2638;
          font-size: 14px;
        }

        .product-meta {
          color: #8791a1;
          font-size: 12px;
        }

        .product-price {
          color: #202a3b;
          font-size: 14px;
        }

        .order-progress {
          margin: 25px 0 10px;
        }

        .progress-step:not(:last-child):after {
          transform: scaleX(0);
          transform-origin: left center;
          animation: orders-progress .7s ease-out forwards;
          animation-delay: .25s;
        }

        .progress-step.complete:not(:last-child):after {
          transform: scaleX(1);
        }

        .progress-dot {
          width: 27px;
          height: 27px;
          border: 3px solid #fff;
          box-shadow: 0 0 0 1px #e4e9f1;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .progress-step.complete .progress-dot {
          background: #ff6848;
          box-shadow: 0 0 0 1px #ffb5a2, 0 4px 12px rgba(255, 104, 72, .2);
          animation: orders-dot-in .4s ease both;
        }

        .progress-step:hover .progress-dot {
          transform: scale(1.12);
        }

        .progress-label {
          color: #929bab;
          font-size: 10px;
        }

        .progress-step.complete .progress-label {
          color: #354156;
        }

        .order-total-box {
          border: 1px solid #eee9e6;
          border-radius: 16px;
          background: linear-gradient(110deg, #fff9f6, #fbfcfe);
          padding: 17px 19px;
        }

        .order-total-box .fw-bold {
          color: #253044;
        }

        .order-total {
          color: #e95d3f;
          font-size: 24px;
          letter-spacing: -.04em;
        }

        .my-orders-page .btn {
          border-radius: 10px;
          font-weight: 700;
          transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
        }

        .my-orders-page .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 16px rgba(23, 32, 51, .1);
        }

        .my-orders-page .btn:active:not(:disabled) {
          transform: translateY(0) scale(.98);
        }

        .review-form {
          border-color: #e8eaf0;
          border-radius: 17px;
          background: linear-gradient(145deg, #fbfcff, #fff8f5);
          animation: orders-reveal .3s ease both;
        }

        .review-form .form-control {
          border-color: #e1e6ed;
          border-radius: 10px;
          box-shadow: none;
        }

        .review-form .form-control:focus {
          border-color: #ff9a80;
          box-shadow: 0 0 0 3px rgba(255, 104, 72, .12);
        }

        .review-star {
          transition: transform .18s ease;
        }

        .review-star:hover {
          transform: scale(1.2) rotate(-8deg);
        }

        .empty-orders {
          border-color: var(--orders-line);
          border-radius: 24px;
          box-shadow: 0 16px 42px rgba(23, 32, 51, .06);
          animation: orders-rise .6s ease both;
        }

        .empty-icon {
          border-radius: 22px;
          background: #fff0eb;
          color: var(--orders-brand);
          animation: orders-float 4s ease-in-out infinite;
        }

        .my-orders-page .alert {
          border: 0;
          border-radius: 13px;
        }

        @keyframes orders-rise {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes orders-reveal {
          from { opacity: 0; transform: translateY(-7px) scale(.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes orders-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes orders-orbit {
          to { transform: rotate(360deg); }
        }

        @keyframes orders-progress {
          to { transform: scaleX(1); }
        }

        @keyframes orders-dot-in {
          from { transform: scale(.65); }
          70% { transform: scale(1.13); }
          to { transform: scale(1); }
        }

        @media (max-width: 991px) {
          .orders-hero {
            padding: 58px 0 84px;
          }

          .orders-hero-art {
            width: min(100%, 290px);
            min-height: 170px;
            padding: 20px;
          }
        }

        @media (max-width: 575px) {
          .my-orders-page {
            padding-bottom: 52px;
          }

          .orders-hero {
            padding: 44px 0 72px;
          }

          .orders-hero h1 {
            font-size: 2.8rem;
          }

          .orders-hero-art {
            display: none;
          }

          .orders-content {
            margin-top: -30px;
          }

          .orders-summary {
            row-gap: 10px;
            margin-bottom: 17px;
          }

          .orders-summary-card {
            min-height: 78px;
            gap: 10px;
            padding: 13px;
            border-radius: 15px;
          }

          .orders-summary-icon {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
            border-radius: 12px;
            font-size: 15px;
          }

          .orders-summary-label {
            font-size: 10px;
          }

          .orders-summary-value {
            font-size: 19px;
          }

          .order-card {
            border-radius: 18px;
          }

          .order-card-header,
          .order-card-body {
            padding: 17px;
          }

          .order-product {
            align-items: flex-start;
          }

          .order-product-thumb {
            width: 58px;
            height: 58px;
            border-radius: 14px;
          }

          .order-progress {
            margin-top: 22px;
          }

          .progress-label {
            font-size: 8px;
          }

          .progress-step:not(:last-child):after {
            left: calc(50% + 12px);
            width: calc(100% - 24px);
          }

          .order-total-box {
            padding: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .my-orders-page *,
          .my-orders-page *::before,
          .my-orders-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <section className="orders-hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="orders-hero-copy">
                <span className="orders-kicker">
                  <i className="bi bi-bag-check" aria-hidden="true"></i>
                  QUICKSELL · YOUR ACCOUNT
                </span>
                <h1>Every order,<br />all in one place.</h1>
                <p className="mb-3">
                  Track deliveries, revisit your purchases, and manage returns with ease.
                </p>
                <span className="orders-count">
                  <i className="bi bi-box-seam" aria-hidden="true"></i>
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="orders-hero-art" aria-hidden="true">
                <div className="orders-art-icon">
                  <i className="bi bi-truck"></i>
                </div>
                <strong>Your next delivery is in motion</strong>
                <span>Live updates, right here in your account.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container orders-content">
        {loading ? (
          <div className="text-center py-5 orders-loading">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">🛍️</div>
            <h4 className="fw-bold">No orders yet</h4>
            <p className="text-muted mb-4">
              Your next great find is waiting for you.
            </p>
            <Link to="/shop" className="btn btn-primary px-4 py-2">
              Explore products
            </Link>
          </div>
        ) : (
          <>
            <div className="row g-3 orders-summary">
              <div className="col-4">
                <div className="orders-summary-card">
                  <div className="orders-summary-icon"><i className="bi bi-receipt"></i></div>
                  <div>
                    <div className="orders-summary-label">Total orders</div>
                    <div className="orders-summary-value">{orders.length}</div>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="orders-summary-card">
                  <div className="orders-summary-icon"><i className="bi bi-box-seam"></i></div>
                  <div>
                    <div className="orders-summary-label">On the way</div>
                    <div className="orders-summary-value">{activeOrders}</div>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="orders-summary-card">
                  <div className="orders-summary-icon"><i className="bi bi-check2-circle"></i></div>
                  <div>
                    <div className="orders-summary-label">Delivered</div>
                    <div className="orders-summary-value">{deliveredOrders}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4">
              {orders.map((order) => {
                const progress = getprogress(order.orderStatus)

                return (
                  <div className="col-12" key={order._id}>
                    <article className="order-card">
                    <div className="order-card-header">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                          <div className="order-label">Order reference</div>
                          <div className="order-id">
                            #{order._id.slice(-6).toUpperCase()}
                          </div>
                          <div className="text-muted small mt-1">
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }
                            )}
                          </div>
                        </div>

                        <span className={getstatusclass(order.orderStatus)}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    <div className="order-card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0">Items ordered</h6>
                        <span className="text-muted small">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {order.items.map((item, index) => {
                        const productId = getProductId(item)
                        const productName = item.productName || item.product?.name || 'Product'
                        const productImage = getProductImage(item.product?.image || item.image || item.productImage)
                        const productLink = productId ? `/product/${productId}` : '/shop'

                        return (
                          <div key={item._id || index}>
                            <div className="order-product">
                              <div className="order-product-main">
                                <Link
                                  to={productLink}
                                  className="order-product-thumb"
                                  title="View product"
                                  aria-label={`View ${productName}`}
                                >
                                  <img src={productImage} alt={productName} />
                                </Link>

                                <div>
                                  <div className="product-name">
                                    {productName}
                                  </div>
                                  <div className="product-meta">
                                    Quantity: {item.quantity}
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex align-items-center flex-wrap gap-3">
                                <div className="product-price">
                                  ₹{(
                                    Number(item.price || 0) *
                                    Number(item.quantity || 0)
                                  ).toLocaleString('en-IN')}
                                </div>

                                {order.orderStatus === 'Delivered' && productId && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                      setReviewTarget({
                                        orderId: order._id,
                                        productId: productId.toString(),
                                        productName: productName
                                      })
                                      setRating(5)
                                      setReviewText('')
                                    }}
                                  >
                                    ★ Write Review
                                  </button>
                                )}
                              </div>
                            </div>

                            {reviewTarget?.orderId === order._id &&
                              reviewTarget?.productId === productId?.toString() && (
                                <div className="review-form">
                                  <h5 className="fw-bold mb-2">
                                    Review: {reviewTarget.productName}
                                  </h5>

                                  <p className="text-muted small">
                                    Share your experience with this product.
                                  </p>

                                  <form onSubmit={handleAddReview}>
                                    <label className="form-label">
                                      Your Rating
                                    </label>

                                    <div className="d-flex gap-2 mb-3">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          type="button"
                                          key={star}
                                          className="review-star"
                                          style={{
                                            color: star <= rating ? '#ffc107' : '#ced4da'
                                          }}
                                          onClick={() => setRating(star)}
                                          aria-label={`${star} star rating`}
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>

                                    <label className="form-label">
                                      Your Review
                                    </label>

                                    <textarea
                                      className="form-control mb-3"
                                      rows="3"
                                      maxLength="1000"
                                      placeholder="Share your experience..."
                                      value={reviewText}
                                      onChange={(e) => setReviewText(e.target.value)}
                                      required
                                    />

                                    <button
                                      type="submit"
                                      className="btn btn-primary"
                                      disabled={reviewLoading}
                                    >
                                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-outline-secondary ms-2"
                                      onClick={() => setReviewTarget(null)}
                                      disabled={reviewLoading}
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                </div>
                              )}
                          </div>
                        )
                      })}

                      {progress >= 0 && (
                        <>
                          <hr className="my-4" />

                          <h6 className="fw-bold mb-1">
                            Delivery progress
                          </h6>
                          <p className="text-muted small">
                            {order.orderStatus === 'Delivered'
                              ? 'Your order has been delivered.'
                              : 'We will update your order as it moves through each stage.'}
                          </p>

                          <div
                            className="order-progress"
                            aria-label={`Order status: ${order.orderStatus}`}
                          >
                            {steps.map((step, index) => (
                              <div
                                key={step}
                                className={`progress-step ${
                                  index <= progress ? 'complete' : ''
                                }`}
                              >
                                <div className="progress-dot">
                                  {index <= progress ? '✓' : index + 1}
                                </div>
                                <div className="progress-label">
                                  {step}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {(order.orderStatus === 'Cancelled' ||
                        order.orderStatus === 'Returned') && (
                        <div className="alert alert-danger mt-3 mb-0">
                          {order.orderStatus === 'Cancelled'
                            ? 'This order has been cancelled.'
                            : 'This order has been returned.'}
                        </div>
                      )}

                      {order.returnRequest?.status &&
                        order.returnRequest.status !== 'None' && (
                          <div className="alert alert-info mt-3 mb-0">
                            <strong>Return request: </strong>
                            {order.returnRequest.status}
                            {order.returnRequest.reason && (
                              <div className="small mt-1">
                                Reason: {order.returnRequest.reason}
                              </div>
                            )}
                          </div>
                        )}

                      {order.refundStatus &&
                        order.refundStatus !== 'Not required' && (
                          <div className="small text-muted mt-3">
                            Refund status: <strong>{order.refundStatus}</strong>
                          </div>
                        )}

                      <hr className="my-4" />

                      <div className="order-total-box">
                        <div className="d-flex justify-content-between align-items-center gap-3">
                          <div>
                            <div className="fw-bold">Order total</div>
                            <div className="text-muted small">
                              {order.deliveryCharge !== undefined
                                ? Number(order.deliveryCharge) === 0
                                  ? 'Free delivery included'
                                  : `Delivery: ₹${Number(order.deliveryCharge).toLocaleString('en-IN')}`
                                : 'Including applicable charges'}
                            </div>
                          </div>

                          <div className="order-total">
                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {order.orderStatus === 'Placed' && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={orderActionLoading === order._id}
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            {orderActionLoading === order._id
                              ? 'Cancelling...'
                              : 'Cancel order'}
                          </button>
                        )}

                        {order.orderStatus === 'Delivered' &&
                          !['Pending', 'Approved'].includes(order.returnRequest?.status) && (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                setReturnTarget(order._id)
                                setReturnReason('')
                              }}
                            >
                              Request return / refund
                            </button>
                          )}
                      </div>

                      {returnTarget === order._id && (
                        <form className="review-form" onSubmit={handleReturnRequest}>
                          <h6 className="fw-bold mb-2">Request a return</h6>
                          <p className="text-muted small">
                            Your request will be reviewed before a refund is issued.
                            COD refunds are processed manually.
                          </p>
                          <label className="form-label" htmlFor={`return-reason-${order._id}`}>
                            Reason for return
                          </label>
                          <textarea
                            id={`return-reason-${order._id}`}
                            className="form-control mb-3"
                            rows="3"
                            maxLength="500"
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            required
                          />
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={returnLoading || !returnReason.trim()}
                          >
                            {returnLoading ? 'Submitting...' : 'Submit request'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm ms-2"
                            onClick={() => setReturnTarget(null)}
                            disabled={returnLoading}
                          >
                            Close
                          </button>
                        </form>
                      )}
                    </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
    </div>
  )
}