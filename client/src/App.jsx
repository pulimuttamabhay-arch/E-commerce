import React, { useEffect, useState } from 'react'
import Home from './Components/Home'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header, { ThemeToggle } from './Components/Header'
import Footer from './Components/Footer'
import Shop from './Components/Shop'
import Category from './Components/Category'
import Checkout from './Components/Checkout'
import Cart from './Components/Cart'
import Contact from './Components/Contact'
import About from './Components/About'
import Register from './Components/Register'
import Product from './Components/Product'
import Login from './Components/Login'
import MyOrders from './Components/MyOrder'
import Wishlist from './Components/Whishlist'
import DemoPayment from './Components/DemoPayment'

function Appcontent() {
  const location = useLocation()
  const hideappbar = ['/login', '/register'].includes(location.pathname.toLowerCase())
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('quicksell-theme') === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.setAttribute('data-bs-theme', theme)
    localStorage.setItem('quicksell-theme', theme)
  }, [theme])

  useEffect(() => {
    const updateScrollTopVisibility = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true })
    updateScrollTopVisibility()

    return () => window.removeEventListener('scroll', updateScrollTopVisibility)
  }, [])

  return (
    <div>
      {!hideappbar && (
        <Header
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        />
      )}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='/category' element={<Category />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/product/:pid' element={<Product />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/demopayment' element={<DemoPayment />} />
      </Routes>

      {!hideappbar && <Footer />}

      {hideappbar && (
        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          className="theme-toggle-floating"
        />
      )}

      {!hideappbar && showScrollTop && (
        <button
          type="button"
          className="scroll-to-top"
          aria-label="Scroll to top"
          title="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className="bi bi-arrow-up" aria-hidden="true"></i>
        </button>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Appcontent />
    </BrowserRouter>
  )
}
