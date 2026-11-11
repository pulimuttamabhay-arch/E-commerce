
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })

    clearTimeout(showToast.timeout)
    showToast.timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 2500)
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      showToast('Please enter your email address.', 'error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(trimmedEmail)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }

    showToast('You are now subscribed for new launches and offers!', 'success')
    setEmail('')
  }

  return (
    <div>
      <style>{`
        .newsletter-toast {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 2000;
          min-width: 280px;
          max-width: 360px;
          padding: 14px 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 18px 35px rgba(15, 23, 42, 0.18);
          opacity: 0;
          transform: translateY(30px) scale(0.94);
          animation: newsletterFadeIn 0.35s ease forwards;
        }

        .newsletter-toast.success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .newsletter-toast.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        @keyframes newsletterFadeIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes newsletterFadeOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(30px) scale(0.94);
          }
        }

        .newsletter-toast.hide {
          animation: newsletterFadeOut 0.35s ease forwards;
        }
      `}</style>

      {toast.visible && (
        <div className={`newsletter-toast ${toast.type} ${toast.visible ? '' : 'hide'}`}>
          <i className={toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      <footer className="footer mt-5">
        <div className="container">
          <div className="row g-4 footer-main">
            <div className="col-lg-4">
              <Link to="/" className="footer-logo">
                Nova<span>Cart</span>
              </Link>

              <p className="footer-description">
                Modern shopping for electronics, gadgets and everyday tech essentials.
                Discover quality products and enjoy a simpler shopping experience.
              </p>

              <div className="footer-social">
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="https://www.twitter.com/" target="_blank" rel="noreferrer" aria-label="Twitter">
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <i className="bi bi-youtube"></i>
                </a>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <h5>
                Shop
              </h5>
              <Link className="d-block mb-3" to="/shop">
                All products
              </Link>
              <Link className="d-block mb-3" to="/category">
                Categories
              </Link>
              <Link className="d-block mb-3" to="/cart">
                Shopping cart
              </Link>
              <Link className="d-block" to="/wishlist">
                Wishlist
              </Link>
            </div>

            <div className="col-6 col-lg-2">
              <h5>
                Company
              </h5>
              <Link className="d-block mb-3" to="/about">
                About us
              </Link>
              <Link className="d-block mb-3" to="/contact">
                Contact
              </Link>
              <Link className="d-block mb-3" to="/myorders">
                My orders
              </Link>
              <Link className="d-block" to="/login">
                My account
              </Link>
            </div>

            <div className="col-lg-4">
              <div className="newsletter">
                <div className="newsletter-icon">
                  <i className="bi bi-envelope-paper-heart"></i>
                </div>
                <h5>
                  Get product updates
                </h5>
                <p>
                  New launches, special offers and useful tech picks. Stay connected with us.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email address"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" className="btn btn-brand">
                    Join <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="footer-features">
            <div className="row g-3">
              <div className="col-6 col-md-4">
                <div className="footer-feature">
                  <i className="bi bi-truck"></i>
                  <div>
                    <strong>Fast Delivery</strong>
                    <small>Delivered to your doorstep</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="footer-feature">
                  <i className="bi bi-shield-check"></i>
                  <div>
                    <strong>Secure Shopping</strong>
                    <small>Shop with confidence</small>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="footer-feature">
                  <i className="bi bi-headset"></i>
                  <div>
                    <strong>Customer Support</strong>
                    <small>We're here to help</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="footer-divider" />

          <div className="footer-bottom">
            <span>
              © 2026 <strong>NovaCart</strong>. All rights reserved.
            </span>
            <span>
              Made for a better shopping experience <i className="bi bi-heart-fill"></i>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
