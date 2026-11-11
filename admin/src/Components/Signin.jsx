import { host } from '../../../client/src/Context/Host.jsx'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Signin() {

  const navigate = useNavigate()

  const [signin, setSignin] = useState({
    email: '',
    password: '',
  })

  // Check token when component loads
  useEffect(() => {
    const token = localStorage.getItem('adminstoken')

    if (token) {
      navigate('/Dashboard', { replace: true })
    }
  }, [navigate])

  // Handle input changes
  const handlechange = (e) => {
    setSignin({
      ...signin,
      [e.target.name]: e.target.value
    })
  }

  // Handle admin login
  const handlelogin = () => {

    if (!signin.email || !signin.password) {
      alert('Please enter email and password')
      return
    }

    axios.post(`${host}/admin/login`, signin)
      .then((res) => {

        console.log('Login response:', res.data)

        alert(res.data.message)

        // Store admin token
        localStorage.setItem('adminstoken', res.data.token)

        console.log('Logged in successfully')

        // Redirect to Dashboard
        navigate('/Dashboard', { replace: true })

      })
      .catch((error) => {

        console.log(error.response?.data || error.message)

        alert(
          error.response?.data?.message || 'Login failed'
        )

      })
  }

  return (
    <div>

      <div className="container d-flex align-items-center justify-content-center min-vh-100 py-4">

        <div className="login-shell w-100" style={{ maxWidth: 960 }}>

          <div className="row g-0 overflow-hidden login-card">

            {/* Left Brand Panel */}
            <div className="col-lg-6 d-none d-lg-flex login-brand-panel p-5 flex-column justify-content-between">

              <div>
                <img
                  src="./assets/images/logo-icon.svg"
                  alt="NovaCart"
                  width={42}
                />

                <div className="brand-word mt-3">
                  NovaCart <span>ADMIN</span>
                </div>

                <p className="text-white-50 mt-3 mb-0">
                  A focused administration dashboard for store operations.
                </p>
              </div>

              <div className="login-feature-list">

                <div>
                  <i className="ti ti-shield-check" />
                  <span>Secure administrator access</span>
                </div>

                <div>
                  <i className="ti ti-chart-dots" />
                  <span>Monitor your store performance</span>
                </div>

                <div>
                  <i className="ti ti-settings" />
                  <span>Control products, orders and payments</span>
                </div>

              </div>

            </div>

            {/* Login Form */}
            <div className="col-lg-6 bg-white p-4 p-md-5">

              <div className="d-flex align-items-center gap-2 mb-4 d-lg-none">

                <img
                  src="./assets/images/logo-icon.svg"
                  alt="NovaCart"
                  width={36}
                />

                <span className="fw-bold fs-4">
                  NovaCart
                </span>

              </div>

              <span className="page-kicker">
                ADMIN ACCESS
              </span>

              <h1 className="h3 fw-bold mb-2 mt-2">
                Welcome back
              </h1>

              <p className="text-secondary mb-4">
                Sign in to manage your NovaCart store.
              </p>

              <div className="needs-validation" noValidate>

                {/* Email */}
                <div className="mb-3">

                  <label htmlFor="email" className="form-label">
                    Admin Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="admin@novacart.com"
                    name="email"
                    value={signin.email}
                    required
                    autoFocus
                    onChange={handlechange}
                  />

                  <div className="invalid-feedback">
                    Please enter a valid admin email.
                  </div>

                </div>

                {/* Password */}
                <div className="mb-3">

                  <label htmlFor="password" className="form-label">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter your password"
                    name="password"
                    value={signin.password}
                    onChange={handlechange}
                    required
                    minLength={6}
                  />

                  <div className="invalid-feedback">
                    Please provide a password (min 6 characters).
                  </div>

                </div>

                {/* Remember Me */}
                <div className="d-flex justify-content-between align-items-center mb-4">

                  <div className="form-check">

                    <input
                      id="remember"
                      className="form-check-input"
                      type="checkbox"
                    />

                    <label
                      className="form-check-label small"
                      htmlFor="remember"
                    >
                      Remember me
                    </label>

                  </div>

                  <a href="#" className="small link-primary">
                    Forgot Password?
                  </a>

                </div>

                {/* Login Button */}
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100"
                  onClick={handlelogin}
                >
                  <i className="ti ti-login me-1" />
                  Login to Admin
                </button>

              </div>

              {/* Login Note */}
              <div className="login-note mt-4">

                <i className="ti ti-info-circle me-2" />

                Only authorized NovaCart administrators should use this page.

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
