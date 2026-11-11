
import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useSearchParams, Link } from 'react-router-dom'

export default function Shop() {
  const [product, setProduct] = useState([])
  const [category, setCategory] = useState([])
  const [selectedcategory, setSelectedcategory] = useState('')
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [wishlist, setWishlist] = useState(
    () => JSON.parse(localStorage.getItem('wishlist')) || []
  )

  const fetchcategory = async () => {
    try {
      const res = await axios.get('http://localhost:7002/category/viewcategory')
      setCategory(res.data.allcategory || [])
    } catch (error) {
      console.log(error)
    }
  }

  const fetchedproduct = async () => {
    try {
      const res = await axios.get('http://localhost:7002/product/viewproduct')
      setProduct(res.data.allproduct || [])
    } catch (error) {
      console.log(error)
    }
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
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Failed to add product to cart'
      )
    }
  }

  useEffect(() => {
    fetchcategory()
    fetchedproduct()
  }, [])

  useEffect(() => {
    setSelectedcategory(searchParams.get('category') || '')
  }, [searchParams])

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

  const toggleWishlist = (productId) => {
    const oldWishlist = JSON.parse(localStorage.getItem('wishlist')) || []

    let newWishlist

    if (oldWishlist.includes(productId)) {
      newWishlist = oldWishlist.filter((id) => id !== productId)
    } else {
      newWishlist = [...oldWishlist, productId]
    }

    localStorage.setItem('wishlist', JSON.stringify(newWishlist))
    setWishlist(newWishlist)
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const filteredproduct = product.filter((pdata) => {
    const productcategory =
      typeof pdata.category === 'object'
        ? pdata.category?._id
        : pdata.category

    const categoryname =
      typeof pdata.category === 'object'
        ? pdata.category?.name || pdata.category?.cname
        : category.find(
            (cdata) => String(cdata._id) === String(productcategory)
          )?.name ||
          category.find(
            (cdata) => String(cdata._id) === String(productcategory)
          )?.cname

    const matchescategory =
      selectedcategory === '' ||
      String(productcategory) === String(selectedcategory)

    const searchtext = String(search || '').toLowerCase().trim()

    const matchessearch =
      String(pdata.name || '').toLowerCase().includes(searchtext) ||
      String(categoryname || '').toLowerCase().includes(searchtext)

    return matchescategory && matchessearch
  })

  return (
    <div>
      <style>{`
        .shop-wishlist-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          color: #ff5a36;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
          z-index: 2;
        }

        .shop-wishlist-btn:hover {
          transform: translateY(-2px) scale(1.04);
          background: #fff;
        }

        .shop-wishlist-btn.active {
          background: #ff5a36;
          color: white;
        }
      `}</style>

      {/* PAGE HEADER */}

      <section className="shop-hero">
        <div className="container">
          <div className="row align-items-center">

            <div className="col-lg-8">
              <span className="eyebrow">
                QUICKSELL COLLECTION
              </span>

              <h1>
                {selectedcategory
                  ? category.find(
                      (cdata) => String(cdata._id) === String(selectedcategory)
                    )?.name ||
                    category.find(
                      (cdata) => String(cdata._id) === String(selectedcategory)
                    )?.cname ||
                    'Shop Products'
                  : 'Find Your Next Favourite'}
                <span className="shop-highlight">.</span>
              </h1>

              <p>
                Explore our collection of quality products.
                Great choices, exciting deals and everything
                you need in one place.
              </p>

              <div className="shop-hero-info">
                <span>
                  <i className="bi bi-check-circle-fill"></i>
                  Quality Products
                </span>

                <span>
                  <i className="bi bi-truck"></i>
                  Easy Shopping
                </span>
              </div>
            </div>

            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div className="shop-hero-card">
                <span>OUR COLLECTION</span>
                <h2>{filteredproduct.length}+</h2>
                <p>Products to explore</p>
                <i className="bi bi-bag-heart-fill"></i>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SHOP SECTION */}

      <section className="section shop-section">
        <div className="container">

          {/* SECTION HEADING */}

          <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
            <div>
              <span className="eyebrow">EXPLORE PRODUCTS</span>
              <h2 className="section-title mb-2">
                {selectedcategory ? 'Selected Collection' : 'All Products'}
              </h2>
              <p className="small-muted mb-0">
                Discover products selected for you.
              </p>
            </div>

            <div className="shop-result-count mt-3 mt-md-0">
              <i className="bi bi-grid"></i>
              Showing {filteredproduct.length} products
            </div>
          </div>

          {/* FILTER BAR */}

          <div className="shop-filter-wrapper mb-5">
            <div className="row g-3 align-items-center">

              <div className="col-lg-7">
                <div className="shop-search">
                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    placeholder="Search by product or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {search && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => setSearch('')}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="col-lg-5">
                <div className="shop-category-select">
                  <i className="bi bi-funnel"></i>

                  <select
                    className="form-select"
                    id="category"
                    value={selectedcategory}
                    onChange={(e) => {
                      const categoryid = e.target.value
                      setSelectedcategory(categoryid)

                      if (categoryid) {
                        setSearchParams({ category: categoryid })
                      } else {
                        setSearchParams({})
                      }
                    }}
                  >
                    <option value="">
                      All Categories
                    </option>

                    {category.map((cdata) => (
                      <option key={cdata._id} value={cdata._id}>
                        {cdata.name || cdata.cname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* PRODUCT GRID */}

          <div className="row g-4" id="shop-grid">

            {filteredproduct.length > 0 ? (

              filteredproduct.map((pdata) => {

                const productcategory =
                  typeof pdata.category === 'object'
                    ? pdata.category?._id
                    : pdata.category

                const categoryname =
                  typeof pdata.category === 'object'
                    ? pdata.category?.name || pdata.category?.cname
                    : category.find(
                        (cdata) => String(cdata._id) === String(productcategory)
                      )?.name ||
                      category.find(
                        (cdata) => String(cdata._id) === String(productcategory)
                      )?.cname

                const rating = Math.min(
                  5,
                  Math.max(0, Math.round(Number(pdata.averageRating) || 0))
                )
                const sellingPrice = Number(pdata.price) || 0
                const mrp = Number(pdata.mrp) || 0
                const discountPercent = mrp > sellingPrice && mrp > 0
                  ? Math.max(1, Math.round(((mrp - sellingPrice) / mrp) * 100))
                  : 0

                return (

                  <div
                    className="col-sm-6 col-lg-4 col-xl-3 shop-product"
                    key={pdata._id}
                  >

                    <div className="product-card shop-product-card">

                      {/* PRODUCT IMAGE */}

                      <div className="shop-image-wrapper">

                        <Link
                          to={`/product/${pdata._id}`}
                          className="product-image-link"
                          aria-label={`View ${pdata.name} details`}
                        >
                          <img
                            className="product-img"
                            src={
                              pdata.image
                                ? `http://localhost:7002/image/${pdata.image}`
                                : '/assets/img/product-1.png'
                            }
                            alt={pdata.name}
                          />
                        </Link>

                        <button
                          type="button"
                          className={`shop-wishlist-btn ${wishlist.includes(pdata._id) ? 'active' : ''}`}
                          title={wishlist.includes(pdata._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          onClick={() => toggleWishlist(pdata._id)}
                        >
                          <i className={wishlist.includes(pdata._id) ? 'bi bi-heart-fill' : 'bi bi-heart'}></i>
                        </button>

                        <span className="shop-new-badge">
                          NEW
                        </span>

                        {discountPercent > 0 && (
                          <span className="shop-discount-badge">
                            <i className="bi bi-tag-fill" aria-hidden="true"></i>
                            {discountPercent}% OFF
                          </span>
                        )}

                        {pdata.stock <= 0 && (
                          <div className="shop-out-overlay">
                            Out of Stock
                          </div>
                        )}

                      </div>

                      {/* PRODUCT DETAILS */}

                      <div className="product-body shop-product-body">

                        <span className="shop-category-name">
                          {categoryname || 'Uncategorized'}
                        </span>

                        <h5 className="shop-product-title">
                          <Link
                            to={`/product/${pdata._id}`}
                            className="product-title-link"
                          >
                            {pdata.name}
                          </Link>
                        </h5>

                        {/* RATING */}

                        <div className="rating shop-rating mb-3">

                          <span className="shop-stars">
                            {'★'.repeat(rating)}
                            {'☆'.repeat(5 - rating)}
                          </span>

                          <span className="small-muted ms-1">
                            {Number(pdata.averageRating || 0).toFixed(1)}
                          </span>

                          <span className="small-muted ms-1">
                            ({pdata.totalReviews || 0})
                          </span>

                        </div>

                        {/* STOCK STATUS */}

                        <div className="shop-stock mb-3">

                          {pdata.stock <= 0 ? (

                            <span className="stock-out">
                              <i className="bi bi-x-circle-fill"></i>
                              Out of Stock
                            </span>

                          ) : pdata.stock <= 5 ? (

                            <span className="stock-low">
                              <i className="bi bi-exclamation-circle-fill"></i>
                              Only {pdata.stock} left
                            </span>

                          ) : (

                            <span className="stock-available">
                              <i className="bi bi-check-circle-fill"></i>
                              In Stock
                            </span>

                          )}

                        </div>

                        {/* PRICE AND CART */}

                        <div className="shop-product-bottom">

                          <div>
                            <span className="shop-price-label">
                              Price
                            </span>

                            <div className="shop-prices">
                              <span className="price">
                                ₹{sellingPrice.toLocaleString('en-IN')}
                              </span>
                              {discountPercent > 0 && (
                                <>
                                  <span className="shop-mrp-price">
                                    ₹{mrp.toLocaleString('en-IN')}
                                  </span>
                                  <span className="shop-savings">
                                    Save ₹{(mrp - sellingPrice).toLocaleString('en-IN')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="shop-cart-btn"
                            title={
                              pdata.stock <= 0
                                ? 'Out of Stock'
                                : 'Add to cart'
                            }
                            disabled={pdata.stock <= 0}
                            onClick={() => addToCart(pdata._id)}
                          >
                            <i className="bi bi-cart-plus"></i>
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              })

            ) : (

              /* EMPTY STATE */

              <div className="col-12">

                <div className="shop-empty">

                  <div className="shop-empty-icon">
                    <i className="bi bi-search"></i>
                  </div>

                  <h3>No Products Found</h3>

                  <p>
                    Sorry, we couldn't find any products matching your search.
                    Try another keyword or select a different category.
                  </p>

                  <button
                    className="btn-brand"
                    onClick={() => {
                      setSearch('')
                      setSelectedcategory('')
                      setSearchParams({})
                    }}
                  >
                    View All Products
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>
      </section>

    </div>
  )
}
