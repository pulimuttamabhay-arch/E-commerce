
import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import axios from 'axios'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const getAuthToken = () =>
    localStorage.getItem('Usertoken') ||
    localStorage.getItem('usertoken') ||
    localStorage.getItem('UserToken')

  const getStoredCartCount = () => {
    const token = getAuthToken()

    if (!token) return 0

    try {
      return Number(JSON.parse(localStorage.getItem('cartCount') || '0')) || 0
    } catch {
      return 0
    }
  }

  const [cartcount, setCartcount] = useState(getStoredCartCount)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(getAuthToken()))

  const [wishlistcount, setWishlistcount] = useState(
    () => (JSON.parse(localStorage.getItem('wishlist')) || []).length
  )

  const syncAuthState = () => {
    setIsLoggedIn(Boolean(getAuthToken()))
  }

  const updateCartCount = async () => {
    try {
      const token = getAuthToken()

      if (!token) {
        localStorage.setItem('cartCount', '0')
        setCartcount(0)
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

      const cart = res.data.items || []

      const totalquantity = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      )

      localStorage.setItem('cartCount', JSON.stringify(totalquantity))
      setCartcount(totalquantity)

    } catch (error) {
      console.log(
        'Cart count error:',
        error.response?.data || error.message
      )

      const savedCount = getStoredCartCount()
      setCartcount(savedCount)
    }
  }

  useEffect(() => {
    syncAuthState()
    updateCartCount()

    const handleAuthChange = () => {
      syncAuthState()
      updateCartCount()
    }

    window.addEventListener('cartUpdated', updateCartCount)
    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('authStateChanged', handleAuthChange)

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount)
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [location.pathname])

  useEffect(() => {
    const updateWishlistCount = () => {
      const items = JSON.parse(localStorage.getItem('wishlist')) || []
      setWishlistcount(items.length)
    }

    window.addEventListener('wishlistUpdated', updateWishlistCount)
    window.addEventListener('storage', updateWishlistCount)

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount)
      window.removeEventListener('storage', updateWishlistCount)
    }
  }, [])

  const handlelogout = () => {
    const conformlogout = window.confirm(
      'Are You Sure Want To Logout ?'
    )

    if (conformlogout) {
      localStorage.removeItem('Usertoken')
      localStorage.removeItem('usertoken')
      localStorage.removeItem('UserToken')
      localStorage.setItem('cartCount', '0')

      setCartcount(0)
      setIsLoggedIn(false)

      window.dispatchEvent(new Event('authStateChanged'))

      alert('logged Out Successfully !! ')
      navigate('/')
    }
  }

  const navClass = (path) => {
    const active = path === '/'
      ? location.pathname === '/'
      : location.pathname === path ||
        (path === '/shop' && location.pathname.startsWith('/product/'))

    return `nav-link${active ? ' active' : ''}`
  }

  return (
    <div className="quicksell-header-shell">

      <div className="quicksell-topline">
        <div className="container">
          <span>
            <i className="bi bi-truck" aria-hidden="true"></i>
            {' '}Free delivery on orders above ₹599
          </span>

          <span className="quicksell-topline-note">
            <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
            {' '}Easy 7-day returns
          </span>
        </div>
      </div>

      <header className="navbar navbar-expand-lg sticky-top quicksell-header">
        <div className="container">

          <Link className="navbar-brand quicksell-logo" to="/" aria-label="QuickSell home">
            Quick<span>Sell</span><small>.</small>
          </Link>

          <button
            className="navbar-toggler quicksell-toggler"
            type="button"
            data-bs-target="#nav"
            data-bs-toggle="collapse"
            aria-controls="nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list" aria-hidden="true"></i>
          </button>

          <div className="collapse navbar-collapse" id="nav">

            <ul className="navbar-nav mx-auto quicksell-nav">

              <li>
                <Link className={navClass('/')} to="/">
                  Home
                </Link>
              </li>

              <li>
                <Link className={navClass('/shop')} to="/shop">
                  Shop
                </Link>
              </li>

              <li>
                <Link className={navClass('/category')} to="/category">
                  Categories
                </Link>
              </li>

              <li>
                <Link className={navClass('/about')} to="/about">
                  About
                </Link>
              </li>

              <li>
                <Link className={navClass('/contact')} to="/contact">
                  Contact
                </Link>
              </li>

              {isLoggedIn && (
                <li>
                  <Link className={navClass('/myorders')} to="/myorders">
                    My Orders
                  </Link>
                </li>
              )}

            </ul>

            <div className="d-flex align-items-center quicksell-actions">

              <Link
                className="icon-btn"
                to="/shop"
                title="Search products"
                aria-label="Search products"
              >
                <i className="bi bi-search"></i>
              </Link>

              {!isLoggedIn ? (
                <Link
                  className="icon-btn"
                  to="/login"
                  title="Login"
                  aria-label="Login"
                >
                  <i className="bi bi-person"></i>
                </Link>
              ) : (
                <button
                  type="button"
                  className="icon-btn logout-btn"
                  onClick={handlelogout}
                  title="Logout"
                  aria-label="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              )}

              <Link
                className="icon-btn position-relative"
                to="/wishlist"
                title="My Wishlist"
                aria-label={`My Wishlist${wishlistcount > 0 ? `, ${wishlistcount} items` : ''}`}
              >
                <i className="bi bi-heart"></i>

                {wishlistcount > 0 && (
                  <span className="count-badge position-absolute top-0 start-100 translate-middle">
                    {wishlistcount > 99 ? '99+' : wishlistcount}
                  </span>
                )}
              </Link>

              {isLoggedIn && (
                <Link
                  className="icon-btn position-relative"
                  to="/cart"
                  title="Shopping Cart"
                  aria-label={`Shopping Cart, ${cartcount} items`}
                >
                  <i className="bi bi-bag"></i>

                  <span className="count-badge position-absolute top-0 start-100 translate-middle">
                    {cartcount > 99 ? '99+' : cartcount}
                  </span>
                </Link>
              )}

            </div>
          </div>
        </div>
      </header>
    </div>
  )
}


// Theme Toggle Component (Named Export)

export function ThemeToggle({ theme, onToggle, className = '' }) {
  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '1px solid var(--bs-border-color)',
        background: 'var(--bs-body-bg)',
        color: 'var(--bs-body-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '18px',
        position: className.includes('floating') ? 'fixed' : 'static',
        right: '22px',
        bottom: '25px',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <i
        className={`bi ${
          theme === 'dark'
            ? 'bi-sun-fill'
            : 'bi-moon-stars-fill'
        }`}
        aria-hidden="true"
      ></i>
    </button>
  )
}
