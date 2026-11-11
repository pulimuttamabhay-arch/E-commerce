
import React, { useState } from 'react'
import { host } from '../Context/Host.jsx'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [login, setLogin] = useState({
    uemail: "",
    upassword: ""
  })
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })

    clearTimeout(showToast.timeout)
    showToast.timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 2200)
  }

  const handelchange = (e) => {
    console.log({ ...login, [e.target.name]: e.target.value })
    setLogin({ ...login, [e.target.name]: e.target.value })
  }

  const handelsubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${host}/User/login`, login)

      console.log('Login response:', res.data)

      const token = res.data.token

      if (!token) {
        showToast('Login response does not contain a token. Check the backend response.', 'error')
        return
      }

      localStorage.setItem('Usertoken', token)
      window.dispatchEvent(new Event('authStateChanged'))

      showToast(res.data.message || 'Login successful', 'success')

      setTimeout(() => navigate('/'), 600)
    } catch (error) {
      console.error(
        'Login error:',
        error.response?.data || error.message
      )

      showToast(
        error.response?.data?.message ||
        'Invalid email or password',
        'error'
      )
    }
  }

  return (
    <div>
      <style>{`
        .login-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 2000;
          min-width: 260px;
          max-width: 360px;
          padding: 14px 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
          opacity: 0;
          transform: translateX(120px) scale(0.9);
          animation: toastIn 0.35s ease forwards;
        }

        .login-toast.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .login-toast.success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        @keyframes toastIn {
          0% {
            opacity: 0;
            transform: translateX(120px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes toastOut {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(120px) scale(0.9);
          }
        }

        .login-toast.hide {
          animation: toastOut 0.35s ease forwards;
        }
      `}</style>

      {toast.visible && (
        <div className={`login-toast ${toast.type} ${toast.visible ? '' : 'hide'}`}>
          <i className={toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      <section className="login-section">
        <div className="login-decoration login-decoration-one"></div>
        <div className="login-decoration login-decoration-two"></div>

        <div className="container">
          <div className="login-layout">

            <div className="login-content">
              <span className="login-eyebrow">
                <i className="bi bi-stars"></i> WELCOME TO QUICKSELL
              </span>

              <h1>
                Shopping made
                <span> simple.</span>
              </h1>

              <p>
                Discover amazing products, track your orders and
                enjoy a smooth shopping experience with QuickSell.
              </p>

              <div className="login-benefits">
                <div>
                  <i className="bi bi-shield-check"></i>
                  <span>Secure Shopping</span>
                </div>
                <div>
                  <i className="bi bi-truck"></i>
                  <span>Easy Order Tracking</span>
                </div>
                <div>
                  <i className="bi bi-heart"></i>
                  <span>Your Favourite Products</span>
                </div>
              </div>
            </div>

            <div className="login-card">
              <div className="login-card-icon">
                <i className="bi bi-person-fill"></i>
              </div>

              <span className="eyebrow">
                WELCOME BACK
              </span>

              <h2 className="mt-2">
                Sign in to your account
              </h2>

              <p className="small-muted">
                Enter your details to continue shopping.
              </p>

              <form onSubmit={handelsubmit}>
                <label className="form-label mt-3">
                  Email Address
                </label>

                <div className="login-input-group">
                  <i className="bi bi-envelope"></i>
                  <input
                    className="form-control"
                    placeholder="you@example.com"
                    type="email"
                    name='uemail'
                    value={login.uemail}
                    onChange={handelchange}
                    required
                  />
                </div>

                <label className="form-label mt-3">
                  Password
                </label>

                <div className="login-input-group">
                  <i className="bi bi-lock"></i>
                  <input
                    className="form-control"
                    placeholder="Enter your password"
                    type="password"
                    name='upassword'
                    value={login.upassword}
                    onChange={handelchange}
                    required
                  />
                </div>

                <button type="submit" className="login-submit-btn mt-4">
                  Sign In
                  <i className="bi bi-arrow-right"></i>
                </button>
              </form>

              <div className="login-divider">
                <span>NEW TO QUICKSELL?</span>
              </div>

              <p className="text-center small-muted mb-0">
                Don't have an account?
                <Link to="/register" className="login-register-link">
                  Create an account
                </Link>
              </p>

              <div className="login-security">
                <i className="bi bi-shield-lock-fill"></i>
                Your information is protected and secure.
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
