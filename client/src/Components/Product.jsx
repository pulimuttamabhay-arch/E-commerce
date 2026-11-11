import { host } from '../Context/Host.jsx'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'

export default function Product() {

    const { pid } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState('')
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
    const [reviews, setReviews] = useState([])
    const [reviewLoading, setReviewLoading] = useState(true)

    const fetchproduct = () => {
        setLoading(true)
        setIsImagePreviewOpen(false)
        console.log(pid)

        axios.get(`${host}/product/getproduct/${pid}`)
            .then((res) => {
                console.log(res)

                setProduct(res.data.singleproduct)
                setSelectedImage('')
                setQuantity(1)
            })
            .catch((error) => {
                console.log(error.response?.data || error)
                setProduct(null)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchproduct()
    }, [pid])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [pid])

    useEffect(() => {
        if (!isImagePreviewOpen) return undefined

        const previousOverflow = document.body.style.overflow
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsImagePreviewOpen(false)
            }
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isImagePreviewOpen])

    const fetchreviews = () => {
        setReviewLoading(true)

        axios.get(`${host}/review/viewreview/${pid}`)
            .then((res) => {
                console.log('Review response:', res.data)

                const reviewData = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data.reviews)
                        ? res.data.reviews
                        : Array.isArray(res.data.allreviews)
                            ? res.data.allreviews
                            : []

                setReviews(reviewData)
            })
            .catch((error) => {
                console.log('Review fetch error:', error.response?.data || error)
                setReviews([])
            })
            .finally(() => {
                setReviewLoading(false)
            })
    }

    useEffect(() => {
        fetchreviews()
    }, [pid])

    const getCurrentUserId = () => {
        const token = localStorage.getItem('Usertoken') ||
            localStorage.getItem('usertoken') ||
            localStorage.getItem('UserToken')

        if (!token) return null

        try {
            const payload = JSON.parse(atob(token.split('.')[1] || ''))
            return payload?.id || payload?._id || payload?.userId || null
        } catch {
            return null
        }
    }

    const currentUserId = getCurrentUserId()
    const currentUserReview = reviews.find((review) => {
        const customerId = review.customer?._id || review.customer
        return customerId && currentUserId && String(customerId) === String(currentUserId)
    })

    const totalReviews = reviews.length

    const averageRating = totalReviews > 0
        ? reviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0
        ) / totalReviews
        : 0

    const getRatingCount = (star) => {
        return reviews.filter(
            (review) => Math.round(Number(review.rating) || 0) === star
        ).length
    }

    const getRatingPercentage = (star) => {
        return totalReviews > 0
            ? (getRatingCount(star) / totalReviews) * 100
            : 0
    }

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('Usertoken') ||
                localStorage.getItem('usertoken') ||
                localStorage.getItem('UserToken')

            if (!token) {
                alert('Please login first')
                return
            }

            if (Number(product.stock) < 1) {
                alert('Product is out of stock')
                return
            }

            if (quantity < 1 || quantity > Number(product.stock)) {
                alert('Requested quantity is unavailable')
                return
            }

            const res = await axios.post(
                `${host}/cart/addtocart`,
                {
                    productId: product._id,
                    quantity: quantity
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            console.log('Add to cart response:', res.data)

            alert('Product added to cart successfully')

        } catch (error) {
            console.log('Add to cart error:', error.response?.data || error)
            alert(error.response?.data?.message || 'Unable to add product')
        }
    }

    if (loading) {
        return (
            <div className="product-loading">
                <div className="container">
                    <div className="product-loading-icon">
                        <i className="bi bi-box-seam"></i>
                    </div>
                    <h4>Loading your product...</h4>
                    <p>Please wait while we get the details ready.</p>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <div className="container">
                    <div className="product-not-found-icon">
                        <i className="bi bi-box-seam"></i>
                    </div>
                    <h3>Product not found</h3>
                    <p>Sorry, we couldn't find the product you're looking for.</p>
                    <Link to="/shop" className="product-back-btn">
                        <i className="bi bi-arrow-left"></i> Back to Shop
                    </Link>
                </div>
            </div>
        )
    }

    const productImage = Array.isArray(product.image)
        ? product.image[0]
        : product.image
    const productImages = [...new Set([
        productImage,
        ...(Array.isArray(product.images) ? product.images : [])
    ].filter(Boolean))]
    const displayedImage = productImages.includes(selectedImage)
        ? selectedImage
        : productImages[0]

    const productRating = Math.min(5, Math.max(0, averageRating))
    const sellingPrice = Number(product.price) || 0
    const mrp = Number(product.mrp) || 0
    const discountPercent = mrp > sellingPrice && mrp > 0
        ? Math.max(1, Math.round(((mrp - sellingPrice) / mrp) * 100))
        : 0

    return (
        <div>

            <main className="section product-detail-section">
                <div className="container">

                    <div className="row g-5 align-items-start">

                        {/* PRODUCT IMAGE */}
                        <div className="col-lg-6">

                            <div className="product-detail-gallery">

                                <div className="product-gallery-top">
                                    <span>
                                        <i className="bi bi-patch-check-fill"></i>
                                        Quality Checked
                                    </span>

                                    <span className="product-gallery-category">
                                        {product.category?.name || product.category?.cname || 'Product'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="detail-image-wrap"
                                    onClick={() => setIsImagePreviewOpen(true)}
                                    aria-label="Open product image preview"
                                >
                                    <img
                                        src={
                                            displayedImage
                                                ? `${host}/image/${displayedImage}`
                                                : '/assets/img/product-1.png'
                                        }
                                        className="detail-img"
                                        alt={product.name || 'Product'}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null
                                            e.currentTarget.src = '/assets/img/product-1.png'
                                        }}
                                    />
                                    <span className="detail-image-zoom-hint">
                                        <i className="bi bi-arrows-fullscreen" aria-hidden="true"></i>
                                        Click to zoom
                                    </span>
                                </button>

                                {productImages.length > 1 && (
                                    <div className="product-detail-thumbnails" aria-label="More product images">
                                        {productImages.map((image,index)=>(
                                            <button
                                                key={`${image}-${index}`}
                                                type="button"
                                                className={`product-detail-thumbnail${displayedImage === image ? ' active' : ''}`}
                                                onClick={()=>setSelectedImage(image)}
                                                aria-label={`View product image ${index + 1}`}
                                                aria-pressed={displayedImage === image}
                                            >
                                                <img
                                                    src={`${host}/image/${image}`}
                                                    alt=""
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="product-gallery-footer">
                                    <div>
                                        <i className="bi bi-shield-check"></i>
                                        <span>Authentic Product</span>
                                    </div>

                                    <div className={Number(product.stock) > 0 ? 'in-stock' : 'out-stock'}>
                                        <i className={`bi ${Number(product.stock) > 0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                                        <span>
                                            {Number(product.stock) > 0
                                                ? 'In Stock'
                                                : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            <div className="product-image-caption">
                                <i className="bi bi-zoom-in"></i>
                                <span>Click the image to zoom in and view the full-size preview.</span>
                            </div>

                        </div>

                        {/* PRODUCT INFORMATION */}
                        <div className="col-lg-6">

                            <div className="product-detail-info">

                                <span className="product-category-label">
                                    {product.category?.name || product.category?.cname || 'QUICKSELL COLLECTION'}
                                </span>

                                <h1 className="product-detail-title">
                                    {product.name}
                                </h1>

                                <div className="product-detail-rating">

                                    <span className="product-stars">
                                        {'★'.repeat(Math.round(productRating))}
                                        {'☆'.repeat(5 - Math.round(productRating))}
                                    </span>

                                    <b>{productRating.toFixed(1)}</b>

                                    <span>
                                        ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                                    </span>

                                </div>

                                <div className="product-detail-price-box">
                                    <div>
                                        <span className="product-price-label">OUR PRICE</span>
                                        <div className="product-detail-price-line">
                                            <h2>
                                                ₹{sellingPrice.toLocaleString('en-IN')}
                                            </h2>
                                            {discountPercent > 0 && (
                                                <span className="product-detail-mrp">
                                                    MRP <del>₹{mrp.toLocaleString('en-IN')}</del>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <span className="product-price-tag">
                                        <i className="bi bi-tag-fill"></i>
                                        {discountPercent > 0 ? `${discountPercent}% OFF` : 'Great Choice'}
                                    </span>
                                </div>

                                <div className="product-detail-divider"></div>

                                <div className="product-description-block">
                                    <h5>
                                        <i className="bi bi-card-text"></i>
                                        Product Description
                                    </h5>

                                    <p>
                                        {product.description || 'No product description available.'}
                                    </p>
                                </div>

                                <div className="product-specifications">

                                    <div>
                                        <span>Brand</span>
                                        <b>{product.brand || 'N/A'}</b>
                                    </div>

                                    <div>
                                        <span>Category</span>
                                        <b>
                                            {product.category?.name || product.category?.cname || 'Product'}
                                        </b>
                                    </div>

                                    <div>
                                        <span>Available Stock</span>
                                        <b className={Number(product.stock) > 0 ? 'stock-available' : 'stock-unavailable'}>
                                            {Number(product.stock) > 0
                                                ? `${product.stock} available`
                                                : 'Out of stock'}
                                        </b>
                                    </div>

                                </div>

                                {/* QUANTITY */}
                                <div className="product-purchase-section">

                                    <label>Quantity</label>

                                    <div className="product-purchase-controls">

                                        <div className="quantity-control">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuantity(
                                                        Math.max(1, quantity - 1)
                                                    )
                                                }
                                                disabled={quantity <= 1}
                                            >
                                                −
                                            </button>

                                            <span>{quantity}</span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuantity(
                                                        Math.min(
                                                            Number(product.stock),
                                                            quantity + 1
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    quantity >= Number(product.stock) ||
                                                    Number(product.stock) < 1
                                                }
                                            >
                                                +
                                            </button>
                                        </div>

                                        <span className="product-quantity-hint">
                                            {Number(product.stock) > 0
                                                ? `${product.stock} items available`
                                                : 'Currently unavailable'}
                                        </span>

                                    </div>

                                    <div className="product-action-buttons">

                                        <button
                                            type="button"
                                            className="product-add-cart-btn"
                                            onClick={handleAddToCart}
                                            disabled={Number(product.stock) < 1}
                                        >
                                            <i className="bi bi-bag-plus"></i>
                                            Add to Cart
                                        </button>

                                        <Link
                                            to="/cart"
                                            className="product-view-cart-btn"
                                        >
                                            <i className="bi bi-cart3"></i>
                                            View Cart
                                        </Link>

                                    </div>

                                </div>

                                {/* PRODUCT INFORMATION BOXES */}
                                <div className="product-benefits">

                                    <div className="product-benefit-card">
                                        <div>
                                            <i className="bi bi-truck"></i>
                                        </div>
                                        <section>
                                            <strong>Free Delivery</strong>
                                            <small>On orders above ₹999</small>
                                        </section>
                                    </div>

                                    <div className="product-benefit-card">
                                        <div>
                                            <i className="bi bi-arrow-repeat"></i>
                                        </div>
                                        <section>
                                            <strong>7-Day Returns</strong>
                                            <small>Easy replacement support</small>
                                        </section>
                                    </div>

                                    <div className="product-benefit-card">
                                        <div>
                                            <i className="bi bi-shield-lock"></i>
                                        </div>
                                        <section>
                                            <strong>Secure Checkout</strong>
                                            <small>Safe shopping experience</small>
                                        </section>
                                    </div>

                                    <div className="product-benefit-card">
                                        <div>
                                            <i className="bi bi-patch-check"></i>
                                        </div>
                                        <section>
                                            <strong>Quality Checked</strong>
                                            <small>Selected for QuickSell</small>
                                        </section>
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {isImagePreviewOpen && (
                <div
                    className="product-image-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${product.name} image preview`}
                    onClick={() => setIsImagePreviewOpen(false)}
                >
                    <button
                        type="button"
                        className="product-image-lightbox-close"
                        onClick={() => setIsImagePreviewOpen(false)}
                        aria-label="Close image preview"
                    >
                        <i className="bi bi-x-lg" aria-hidden="true"></i>
                    </button>
                    <div className="product-image-lightbox-content" onClick={(event) => event.stopPropagation()}>
                        <img
                            src={
                                displayedImage
                                    ? `${host}/image/${displayedImage}`
                                    : '/assets/img/product-1.png'
                            }
                            alt={`${product.name} enlarged preview`}
                        />
                        <p>{product.name}</p>
                    </div>
                    <span className="product-image-lightbox-help">Press Esc or click outside the image to close</span>
                </div>
            )}

            {/* CUSTOMER REVIEWS */}
            <section className="section product-reviews-section">
                <div className="container">

                    <div className="product-reviews-heading">
                        <div>
                            <span className="eyebrow">CUSTOMER FEEDBACK</span>
                            <h2>What customers <span>say.</span></h2>
                            <p>
                                Real feedback from customers about their shopping experience.
                            </p>
                        </div>
                    </div>

                    <div className="row g-4">

                        <div className="col-lg-8">

                            {reviewLoading ? (

                                <div className="product-review-loading">
                                    <div className="spinner-border text-warning"></div>
                                    <p>Loading customer reviews...</p>
                                </div>

                            ) : (

                                <>

                                    <div className="product-rating-summary">

                                        {currentUserReview && (
                                            <div className="product-review-card" style={{ marginBottom: '18px', borderColor: '#dbeafe', background: '#f8fbff' }}>
                                                <div className="product-review-top">
                                                    <div className="product-review-customer">
                                                        <div className="product-review-avatar" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                                                            <i className="bi bi-person-fill"></i>
                                                        </div>

                                                        <div>
                                                            <strong>Your rating</strong>
                                                            <div className="product-review-stars">
                                                                {'★'.repeat(Math.min(5, Math.max(0, Math.round(Number(currentUserReview.rating) || 0))))}
                                                                {'☆'.repeat(5 - Math.min(5, Math.max(0, Math.round(Number(currentUserReview.rating) || 0))))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <small>
                                                        {currentUserReview.createdAt
                                                            ? new Date(currentUserReview.createdAt).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })
                                                            : 'Today'}
                                                    </small>
                                                </div>

                                                <p>
                                                    {currentUserReview.comment || 'No comment provided.'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="product-rating-overview">

                                            <h1>
                                                {averageRating.toFixed(1)}
                                                <small>/5</small>
                                            </h1>

                                            <div className="product-rating-stars">
                                                {'★'.repeat(Math.round(averageRating))}
                                                {'☆'.repeat(5 - Math.round(averageRating))}
                                            </div>

                                            <p>
                                                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                                            </p>

                                        </div>

                                        <div className="product-rating-breakdown">

                                            {[5, 4, 3, 2, 1].map((star) => (
                                                <div
                                                    className="product-rating-row"
                                                    key={star}
                                                >

                                                    <span>{star} <i className="bi bi-star-fill"></i></span>

                                                    <div className="progress">
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${getRatingPercentage(star)}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <small>
                                                        {getRatingCount(star)}
                                                    </small>

                                                </div>
                                            ))}

                                        </div>

                                    </div>

                                    {reviews.length === 0 ? (

                                        <div className="product-no-reviews">
                                            <div className="product-no-reviews-icon">
                                                <i className="bi bi-chat-square-heart"></i>
                                            </div>

                                            <h5>No reviews yet</h5>

                                            <p>
                                                Be the first to share your experience.
                                                After your order is delivered, you can
                                                review this product from My Orders.
                                            </p>

                                        </div>

                                    ) : (

                                        reviews.map((review) => (
                                            <div
                                                className="product-review-card"
                                                key={review._id}
                                            >

                                                <div className="product-review-top">

                                                    <div className="product-review-customer">

                                                        <div className="product-review-avatar">
                                                            <i className="bi bi-person-fill"></i>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {review.customer?.name || 'Customer'}
                                                            </strong>

                                                            <div className="product-review-stars">
                                                                {'★'.repeat(Math.min(5, Math.max(0, Math.round(Number(review.rating) || 0))))}
                                                                {'☆'.repeat(5 - Math.min(5, Math.max(0, Math.round(Number(review.rating) || 0))))}
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <small>
                                                        {review.createdAt
                                                            ? new Date(review.createdAt).toLocaleDateString(
                                                                'en-IN',
                                                                {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                }
                                                            )
                                                            : ''}
                                                    </small>

                                                </div>

                                                <p>
                                                    {review.comment || 'No comment provided.'}
                                                </p>

                                            </div>
                                        ))

                                    )}

                                </>

                            )}

                            <div className="product-write-review-card">

                                <div className="product-write-review-icon">
                                    <i className="bi bi-pencil-square"></i>
                                </div>

                                <div>
                                    <h5>Want to review this product?</h5>

                                    <p>
                                        Share your experience after your order has been delivered.
                                    </p>

                                    <Link
                                        to="/myorders"
                                        className="product-review-btn"
                                    >
                                        Go to My Orders
                                        <i className="bi bi-arrow-right"></i>
                                    </Link>
                                </div>

                            </div>

                        </div>

                        <div className="col-lg-4">

                            <div className="product-review-side-card">

                                <div className="product-review-side-icon">
                                    <i className="bi bi-heart"></i>
                                </div>

                                <h4>Thank you for choosing QuickSell!</h4>

                                <p>
                                    Your feedback helps other customers make better shopping decisions.
                                </p>

                                <div className="product-review-side-points">
                                    <div>
                                        <i className="bi bi-check-circle-fill"></i>
                                        Genuine customer feedback
                                    </div>

                                    <div>
                                        <i className="bi bi-check-circle-fill"></i>
                                        Helpful product insights
                                    </div>

                                    <div>
                                        <i className="bi bi-check-circle-fill"></i>
                                        Better shopping experience
                                    </div>
                                </div>

                                <Link to="/shop">
                                    Explore More Products
                                    <i className="bi bi-arrow-right"></i>
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

        </div>
    )
}
