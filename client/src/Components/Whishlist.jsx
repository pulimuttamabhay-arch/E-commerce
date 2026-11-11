
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(
    () => JSON.parse(localStorage.getItem('wishlist')) || []
  )

  const [product, setProduct] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchproduct = () => {
    axios.get('http://localhost:7002/product/viewproduct')
      .then((res) => {
        setProduct(res.data.allproduct || [])
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchproduct()
  }, [])

  useEffect(() => {
    const updateWishlist = () => {
      setWishlist(JSON.parse(localStorage.getItem('wishlist')) || [])
    }

    window.addEventListener('wishlistUpdated', updateWishlist)
    window.addEventListener('storage', updateWishlist)

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlist)
      window.removeEventListener('storage', updateWishlist)
    }
  }, [])

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

  const removeWishlist = (productId) => {
    const newWishlist = wishlist.filter(
      (id) => id !== productId
    )

    localStorage.setItem('wishlist', JSON.stringify(newWishlist))
    setWishlist(newWishlist)

    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('Usertoken')

      if (!token) {
        alert('Please login to add products to cart')
        return
      }

      const selectedProduct = product.find(
        (pdata) => pdata._id === productId
      )

      if (!selectedProduct || selectedProduct.stock <= 0) {
        alert('This product is out of stock')
        return
      }

      const res = await axios.post(
        'http://localhost:7002/cart/addtocart',
        {
          productId: productId,
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.data.success) {
        alert('Product added to cart')
        window.dispatchEvent(new Event('cartUpdated'))
      } else {
        alert(res.data.message || 'Failed to add product to cart')
      }

    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Failed to add product to cart'
      )
    }
  }

  const wishlistproduct = product.filter(
    (pdata) => wishlist.includes(pdata._id)
  )

  return (
    <div className="wishlist-page">
      <style>{`
        .wishlist-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 75px;
          color: #101828;
        }

        .wishlist-hero {
          position: relative;
          overflow: hidden;
          padding: 65px 0 100px;
          background: linear-gradient(120deg, #fff3ee, #fff 65%, #ffede6);
        }

        .wishlist-hero .container {
          position: relative;
          z-index: 2;
        }

        .wishlist-hero h1 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(35px, 5vw, 52px);
          font-weight: 800;
          letter-spacing: -1.5px;
          color: #101828;
        }

        .wishlist-hero h1 span {
          color: #ff5a36;
        }

        .wishlist-hero p {
          color: #667085;
          font-size: 15px;
        }

        .wishlist-hero-decoration {
          position: absolute;
          width: 300px;
          height: 300px;
          border: 45px solid rgba(255,90,54,.08);
          border-radius: 50%;
          right: 10%;
          top: -120px;
        }

        .wishlist-count {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #f3dcd4;
          border-radius: 30px;
          color: #ff5a36;
          font-size: 13px;
          font-weight: 700;
        }

        .wishlist-content {
          position: relative;
          z-index: 3;
          margin-top: -42px;
        }

        .wishlist-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          padding: 21px 24px;
          margin-bottom: 25px;
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(16,24,40,.04);
        }

        .wishlist-toolbar h5 {
          margin: 0;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          color: #101828;
        }

        .wishlist-toolbar p {
          margin: 5px 0 0;
          color: #98a2b3;
          font-size: 13px;
        }

        .wishlist-shop-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 11px 17px;
          border: 1px solid #ff5a36;
          border-radius: 9px;
          background: #fff;
          color: #ff5a36;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: .25s ease;
        }

        .wishlist-shop-btn:hover {
          background: #ff5a36;
          color: white;
          transform: translateY(-2px);
        }

        .wishlist-product-card {
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 14px;
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 17px;
          box-shadow: 0 5px 20px rgba(16,24,40,.04);
          transition: .3s ease;
        }

        .wishlist-product-card:hover {
          transform: translateY(-6px);
          border-color: #ffd3c6;
          box-shadow: 0 15px 35px rgba(16,24,40,.09);
        }

        .wishlist-product-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .wishlist-favourite-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          background: #fff1ed;
          border-radius: 20px;
          color: #ff5a36;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .wishlist-remove-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #fee2e2;
          border-radius: 50%;
          background: #fff5f5;
          color: #e5484d;
          font-size: 15px;
          transition: .2s ease;
        }

        .wishlist-remove-btn:hover {
          background: #e5484d;
          color: white;
          transform: scale(1.08);
        }

        .wishlist-image-box {
          height: 195px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          margin-bottom: 16px;
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
        }

        .wishlist-product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform .35s ease;
        }

        .wishlist-product-card:hover .wishlist-product-image {
          transform: scale(1.07);
        }

        .wishlist-product-link {
          text-decoration: none;
          color: inherit;
        }

        .wishlist-product-name {
          min-height: 42px;
          margin-bottom: 8px;
          color: #101828;
          font-size: 14px;
          font-weight: 750;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .wishlist-product-price {
          margin-bottom: 12px;
          color: #ff5a36;
          font-size: 20px;
          font-weight: 800;
        }

        .wishlist-stock {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 15px;
          font-size: 11px;
          font-weight: 700;
        }

        .wishlist-stock:before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .wishlist-stock.in-stock {
          color: #16803d;
        }

        .wishlist-stock.out-stock {
          color: #d92d20;
        }

        .wishlist-cart-btn {
          width: 100%;
          margin-top: auto;
          padding: 11px 10px;
          border: 1px solid #ff5a36;
          border-radius: 9px;
          background: #ff5a36;
          color: white;
          font-size: 12px;
          font-weight: 800;
          transition: .25s ease;
        }

        .wishlist-cart-btn:hover:not(:disabled) {
          background: #e94a28;
          border-color: #e94a28;
          transform: translateY(-2px);
        }

        .wishlist-cart-btn:disabled {
          background: #eaecf0;
          border-color: #eaecf0;
          color: #98a2b3;
          cursor: not-allowed;
        }

        .wishlist-empty {
          padding: 65px 20px;
          text-align: center;
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(16,24,40,.04);
        }

        .wishlist-empty-icon {
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 22px;
          border-radius: 28px;
          background: #fff1ed;
          color: #ff5a36;
          font-size: 38px;
        }

        .wishlist-empty h4 {
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          color: #101828;
        }

        .wishlist-empty p {
          max-width: 420px;
          margin: 10px auto 22px;
          color: #667085;
          font-size: 14px;
          line-height: 1.7;
        }

        .wishlist-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 22px;
          background: #ff5a36;
          border: 1px solid #ff5a36;
          border-radius: 9px;
          color: white;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: .25s ease;
        }

        .wishlist-empty-btn:hover {
          background: #e94a28;
          color: white;
          transform: translateY(-2px);
        }

        .wishlist-loading {
          padding: 60px 20px;
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 18px;
          text-align: center;
        }

        .wishlist-loading .spinner-border {
          color: #ff5a36;
        }

        @media (max-width: 767px) {
          .wishlist-hero {
            padding: 50px 0 85px;
          }

          .wishlist-hero-decoration {
            right: -130px;
          }

          .wishlist-toolbar {
            padding: 17px;
          }

          .wishlist-image-box {
            height: 170px;
          }
        }

        @media (max-width: 575px) {
          .wishlist-hero {
            padding: 42px 0 75px;
          }

          .wishlist-hero h1 {
            font-size: 36px;
          }

          .wishlist-content {
            margin-top: -30px;
          }

          .wishlist-product-card {
            padding: 10px;
            border-radius: 13px;
          }

          .wishlist-image-box {
            height: 135px;
            padding: 7px;
          }

          .wishlist-product-name {
            font-size: 12px;
            min-height: 36px;
          }

          .wishlist-product-price {
            font-size: 17px;
          }

          .wishlist-cart-btn {
            padding: 9px 5px;
            font-size: 11px;
          }

          .wishlist-favourite-label {
            font-size: 9px;
            padding: 5px 7px;
          }

          .wishlist-remove-btn {
            width: 30px;
            height: 30px;
          }

          .wishlist-toolbar {
            align-items: flex-start;
          }

          .wishlist-shop-btn {
            width: 100%;
            justify-content: center;
          }

          .wishlist-empty {
            padding: 45px 15px;
          }
        }
      `}</style>

      <section className="wishlist-hero">
        <div className="wishlist-hero-decoration"></div>
        <div className="container">
          <span className="eyebrow">
            YOUR COLLECTION
          </span>

          <h1 className="mt-3 mb-2">
            My Wishlist <span>♥</span>
          </h1>

          <p className="mb-4">
            All your favourite products, saved in one place.
          </p>

          <span className="wishlist-count">
            <i className="bi bi-heart-fill"></i>
            {wishlist.length} {wishlist.length === 1 ? 'Saved Product' : 'Saved Products'}
          </span>
        </div>
      </section>

      <section className="container wishlist-content">
        {loading ? (
          <div className="wishlist-loading">
            <div className="spinner-border" role="status"></div>
            <p className="text-muted mt-3 mb-0">
              Loading your favourite products...
            </p>
          </div>
        ) : wishlistproduct.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <i className="bi bi-heartbreak"></i>
            </div>

            <h4>Your wishlist is empty</h4>

            <p>
              You haven't saved any products yet. Explore our collection and tap the heart icon to save your favourite products here.
            </p>

            <Link to="/shop" className="wishlist-empty-btn">
              <i className="bi bi-bag"></i>
              Explore Products
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-toolbar">
              <div>
                <h5>Your Favourite Products</h5>
                <p>
                  {wishlistproduct.length} products saved for later
                </p>
              </div>

              <Link to="/shop" className="wishlist-shop-btn">
                <i className="bi bi-plus-circle"></i>
                Discover More
              </Link>
            </div>

            <div className="row g-3 g-md-4">
              {wishlistproduct.map((pdata) => (
                <div className="col-6 col-md-4 col-lg-3" key={pdata._id}>
                  <div className="wishlist-product-card">
                    <div className="wishlist-product-top">
                      <span className="wishlist-favourite-label">
                        <i className="bi bi-heart-fill"></i>
                        Favourite
                      </span>

                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                        onClick={() => removeWishlist(pdata._id)}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>

                    <Link
                      to={`/product/${pdata._id}`}
                      className="wishlist-product-link"
                    >
                      <div className="wishlist-image-box">
                        <img
                          src={getProductImage(pdata.image)}
                          alt={pdata.name}
                          className="wishlist-product-image"
                        />
                      </div>

                      <h5 className="wishlist-product-name">
                        {pdata.name}
                      </h5>

                      <h6 className="wishlist-product-price">
                        ₹{Number(pdata.price || 0).toLocaleString('en-IN')}
                      </h6>
                    </Link>

                    <p className={
                      pdata.stock <= 0
                        ? 'wishlist-stock out-stock'
                        : 'wishlist-stock in-stock'
                    }>
                      {pdata.stock <= 0 ? 'Out of Stock' : 'In Stock'}
                    </p>

                    <button
                      type="button"
                      className="wishlist-cart-btn"
                      onClick={() => addToCart(pdata._id)}
                      disabled={pdata.stock <= 0}
                    >
                      {pdata.stock <= 0 ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <i className="bi bi-cart-plus me-2"></i>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
