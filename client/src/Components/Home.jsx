
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Home() {

    const [wishlist, setWishlist] = useState(
        () => JSON.parse(localStorage.getItem('wishlist')) || []
    )

    const [product, setProduct] = useState([])
    const [category, setCategory] = useState([])
    const [activeSlide, setActiveSlide] = useState(0)

    const heroSlides = [
        {
            title: 'Everything you need,',
            highlight: 'all in one place.',
            subtitle: 'Shop premium gadgets, beauty essentials, smart tech and everyday must-haves.',
            image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
            tag: 'New season · smart living'
        },
        {
            title: 'Smart tech for',
            highlight: 'work, play and life.',
            subtitle: 'Discover fast devices, accessories and creator gear built for modern living.',
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
            tag: 'Trending now · electronics'
        },
        {
            title: 'Beauty, care and',
            highlight: 'everyday essentials.',
            subtitle: 'Find trusted picks for your home, routine and lifestyle upgrades.',
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
            tag: 'Fresh arrivals · top picks'
        }
    ]

    const fetchcategory = () => {
        axios.get('http://localhost:7002/category/viewcategory')
            .then((res) => {
                console.log(res)
                setCategory(res.data.allcategory)
            })
            .catch((error) => {
                console.log(error.response?.data || error.message)
            })
    }

    const fetchedproduct = () => {
        axios.get('http://localhost:7002/product/viewproduct')
            .then((res) => {
                console.log(res)
                setProduct(res.data.allproduct)
            })
            .catch((error) => {
                console.log(error.response?.data || error.message)
            })
    }

    useEffect(() => {
        fetchedproduct()
        fetchcategory()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [heroSlides.length])

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

    const activeHero = heroSlides[activeSlide]
    const favoriteProducts = [...product]
        .sort((a, b) => {
            const purchaseDifference =
                Number(b.totalPurchased || 0) - Number(a.totalPurchased || 0)
            const reviewDifference =
                Number(b.totalReviews || 0) - Number(a.totalReviews || 0)
            const ratingDifference =
                Number(b.averageRating || 0) - Number(a.averageRating || 0)

            return purchaseDifference || reviewDifference || ratingDifference
        })
        .slice(0, 8)

    return (
        <div className="home-page">
            <style>{`
                .hero {
                    position: relative;
                    overflow: hidden;
                    min-height: 620px;
                    background: #0f172a;
                    display: flex;
                    align-items: center;
                }

                .hero-slider {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }

                .hero-slide {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    opacity: 0;
                    transform: scale(1.08);
                    transition: opacity 0.8s ease, transform 0.8s ease;
                }

                .hero-slide.active {
                    opacity: 1;
                    transform: scale(1);
                }

                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(5, 10, 20, 0.82), rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.2));
                }

                .hero-content-wrap {
                    position: relative;
                    z-index: 1;
                    padding-top: 64px;
                    padding-bottom: 64px;
                }

                .hero-content {
                    color: white;
                    max-width: 620px;
                }

                .hero-eyebrow {
                    background: rgba(255,255,255,0.14);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #f8fafc;
                    backdrop-filter: blur(8px);
                }

                .hero-content h1 {
                    font-size: clamp(2.8rem, 5vw, 5rem);
                    line-height: 1.08;
                    font-weight: 800;
                    letter-spacing: -0.05em;
                    color: #fff;
                    max-width: 560px;
                }

                .hero-content p {
                    font-size: 1.08rem;
                    color: rgba(255,255,255,0.85);
                    max-width: 540px;
                }

                .hero-points span {
                    color: rgba(255,255,255,0.9);
                    font-size: 0.92rem;
                }

                .hero-visual-card {
                    position: relative;
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 26px;
                    padding: 22px;
                    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
                }

                .mini-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.12);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.18);
                    border-radius: 14px;
                    padding: 12px 14px;
                    font-size: 0.8rem;
                }

                .mini-card strong {
                    font-size: 0.96rem;
                }

                .mini-card-top {
                    margin-bottom: 18px;
                }

                .mini-card-bottom {
                    margin-top: 18px;
                }

                .hero-product-box {
                    border-radius: 22px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.06);
                }

                .hero-product-box img {
                    width: 100%;
                    height: 320px;
                    object-fit: cover;
                    display: block;
                }

                .hero-dots {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 18px;
                }

                .hero-dot {
                    width: 12px;
                    height: 12px;
                    border: none;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.45);
                    transition: all 0.25s ease;
                }

                .hero-dot.active {
                    width: 34px;
                    border-radius: 999px;
                    background: #ff5a36;
                }

                @media (max-width: 991px) {
                    .hero {
                        min-height: 560px;
                    }

                    .hero-visual-card {
                        margin-top: 20px;
                    }
                }
            `}</style>

            {/* HERO SECTION */}

            <section className="hero">
                <div className="hero-slider">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className="hero-overlay" />
                        </div>
                    ))}
                </div>

                <div className="container hero-content-wrap">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-7">
                            <div className="hero-content" key={`hero-copy-${activeSlide}`}>
                                <span className="eyebrow hero-eyebrow">
                                    {activeHero.tag}
                                </span>

                                <h1 className="mt-3">
                                    {activeHero.title}{' '}
                                    <span className="nc-highlight">{activeHero.highlight}</span>
                                </h1>

                                <p className="mt-4">
                                    {activeHero.subtitle}
                                </p>

                                <div className="d-flex gap-2 mt-4 flex-wrap">
                                    <Link className="btn btn-brand" to="/shop">
                                        Shop collection
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </Link>

                                    <Link className="btn btn-outline-light" to="/category">
                                        Explore categories
                                    </Link>
                                </div>

                                <div className="d-flex gap-4 mt-5 small-muted flex-wrap hero-points">
                                    <span>
                                        <i className="bi bi-shield-check text-success me-1"></i>
                                        Secure checkout
                                    </span>

                                    <span>
                                        <i className="bi bi-arrow-repeat text-success me-1"></i>
                                        Easy returns
                                    </span>

                                    <span>
                                        <i className="bi bi-truck text-success me-1"></i>
                                        Fast delivery
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="hero-visual-card">
                                <div className="mini-card mini-card-top">
                                    <span>Best sellers</span>
                                    <strong>4.9/5</strong>
                                </div>

                                <div className="hero-product-box">
                                    <img
                                        src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80"
                                        alt="Featured tech product"
                                    />
                                </div>

                                <div className="mini-card mini-card-bottom">
                                    <span>Free shipping</span>
                                    <strong>On orders above ₹599</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-dots">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`hero-dot ${index === activeSlide ? 'active' : ''}`}
                                onClick={() => setActiveSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>


            {/* SHOP BY CATEGORY */}

            <section className="section home-category-section">
                <div className="container">

                    <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">

                        <div>
                            <span className="eyebrow">
                                Browse collections
                            </span>

                            <h2 className="section-title mt-2">
                                Shop by category
                            </h2>

                            <p className="small-muted mb-0">
                                Find exactly what you are looking for.
                            </p>
                        </div>

                        <Link className="fw-bold text-dark text-decoration-none" to="/category">
                            View all <i className="bi bi-arrow-right"></i>
                        </Link>

                    </div>

                    <div className="row g-4">

                        {category.map((cdata) => (
                            <div className="col-6 col-md-6 col-lg-3" key={cdata._id}>

                                <Link
                                    to={`/shop?category=${cdata._id}`}
                                    className="text-decoration-none"
                                >

                                    <div className="category-card h-100">

                                        <img
                                            src={
                                                cdata.image
                                                    ? `http://localhost:7002/image/${cdata.image}`
                                                    : '/assets/img/product-1.png'
                                            }
                                            className="card-img-top"
                                            alt={cdata.name}
                                        />

                                        <div className="card-body">

                                            <h5 className="text-dark mb-1">
                                                {cdata.name}
                                            </h5>

                                            <span className="small-muted">
                                                Explore collection
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </span>

                                        </div>

                                    </div>

                                </Link>

                            </div>
                        ))}

                    </div>

                </div>
            </section>


            {/* CUSTOMER FAVOURITES */}

            <section className="section pt-0 home-favorites-section">
                <div className="container">

                    <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">

                        <div>
                            <span className="eyebrow">
                                Trending now
                            </span>

                            <h2 className="section-title mt-2">
                                Customer favourites
                            </h2>

                            <p className="small-muted mb-0">
                                Discover products our customers love.
                            </p>
                        </div>

                        <Link className="fw-bold text-dark text-decoration-none" to="/shop">
                            Shop all <i className="bi bi-arrow-right"></i>
                        </Link>

                    </div>

                    <div className="row g-4" id="featured-grid">

                        {favoriteProducts.map((pdata) => {
                            const sellingPrice = Number(pdata.price) || 0
                            const mrp = Number(pdata.mrp) || 0
                            const discountPercent = mrp > sellingPrice && mrp > 0
                                ? Math.max(1, Math.round(((mrp - sellingPrice) / mrp) * 100))
                                : 0

                            return (
                            <div
                                className="col-6 col-md-6 col-lg-3"
                                key={pdata._id}
                            >

                                <div className="product-card overflow-hidden">

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

                                        {discountPercent > 0 && (
                                            <span className="home-discount-badge">
                                                <i className="bi bi-tag-fill" aria-hidden="true"></i>
                                                {discountPercent}% OFF
                                            </span>
                                        )}

                                    </Link>

                                    <div className="product-body">

                                        <div className="d-flex justify-content-between align-items-center gap-2">

                                            <span className="small-muted text-truncate">

                                                {
                                                    typeof pdata.category === 'object' && pdata.category !== null
                                                        ? pdata.category.name || 'Uncategorized'
                                                        : category.find(
                                                            (cdata) => cdata._id === pdata.category
                                                        )?.name || 'Uncategorized'
                                                }

                                            </span>

                                            <span className="badge badge-sale">
                                                New
                                            </span>

                                        </div>

                                        <h5 className="mt-3 mb-2">

                                            <Link
                                                to={`/product/${pdata._id}`}
                                                className="product-title-link"
                                            >
                                                {pdata.name}
                                            </Link>

                                        </h5>

                                        <div className="rating mb-3">

                                            <span style={{ color: '#ffc107' }}>

                                                {'★'.repeat(
                                                    Math.min(5, Math.max(0, Math.round(Number(pdata.averageRating) || 0)))
                                                )}

                                                {'☆'.repeat(
                                                    5 - Math.min(5, Math.max(0, Math.round(Number(pdata.averageRating) || 0)))
                                                )}

                                            </span>

                                            <span className="small-muted ms-2">
                                                {Number(pdata.averageRating || 0).toFixed(1)}
                                            </span>

                                            <span className="small-muted ms-1">
                                                ({pdata.totalReviews || 0})
                                            </span>

                                        </div>

                                        <div className="d-flex justify-content-between mb-3 home-product-pricing">

                                            <span className="home-prices">
                                                <span className="price">
                                                    ₹{sellingPrice.toLocaleString('en-IN')}
                                                </span>
                                                {discountPercent > 0 && (
                                                    <del className="home-mrp-price">
                                                        ₹{mrp.toLocaleString('en-IN')}
                                                    </del>
                                                )}
                                            </span>

                                            {pdata.stock <= 0 ? (

                                                <span className="text-danger small fw-bold">
                                                    Out of Stock
                                                </span>

                                            ) : (

                                                <span className="text-success small fw-bold">
                                                    In Stock
                                                </span>

                                            )}

                                        </div>

                                        <div className="d-flex align-items-center gap-2">

                                            {/* ADD TO CART */}

                                            <button
                                                type="button"
                                                className="icon-btn"
                                                title={
                                                    pdata.stock <= 0
                                                        ? 'Out of Stock'
                                                        : 'Add to cart'
                                                }
                                                disabled={pdata.stock <= 0}
                                                onClick={() => addToCart(pdata._id)}
                                            >

                                                <i className="bi bi-bag-plus"></i>

                                            </button>


                                            {/* WISHLIST */}

                                            <button
                                                type="button"
                                                className="icon-btn"
                                                title={
                                                    wishlist.includes(pdata._id)
                                                        ? 'Remove from wishlist'
                                                        : 'Add to wishlist'
                                                }
                                                onClick={() => toggleWishlist(pdata._id)}
                                                style={{
                                                    color: wishlist.includes(pdata._id)
                                                        ? '#e63946'
                                                        : 'inherit',
                                                    background: wishlist.includes(pdata._id)
                                                        ? '#fff0f0'
                                                        : 'white',
                                                    border: '1px solid #ddd'
                                                }}
                                            >

                                                <i className={
                                                    wishlist.includes(pdata._id)
                                                        ? 'bi bi-heart-fill'
                                                        : 'bi bi-heart'
                                                }></i>

                                            </button>


                                            {/* VIEW PRODUCT */}

                                            <Link
                                                to={`/product/${pdata._id}`}
                                                className="btn btn-outline-dark btn-sm ms-auto"
                                            >
                                                View
                                            </Link>

                                        </div>

                                    </div>

                                </div>

                            </div>
                            )
                        })}

                    </div>

                    {product.length === 0 && (

                        <div className="text-center py-5">

                            <i className="bi bi-box-seam display-4 text-secondary"></i>

                            <h5 className="mt-3">
                                No products available
                            </h5>

                            <p className="small-muted">
                                Please check back later for new products.
                            </p>

                        </div>

                    )}

                </div>
            </section>


            {/* BANNER SECTION */}

            <section className="section pt-0">
                <div className="container">

                    <div className="banner">

                        <div className="row align-items-center g-4">

                            <div className="col-lg-8">

                                <span className="eyebrow text-white">
                                    For creators &amp; gamers
                                </span>

                                <h2 className="display-font mt-2">
                                    Upgrade your setup without overcomplicating it.
                                </h2>

                                <p className="mt-3 mb-0">
                                    Shop practical gear for work, play and everything between.
                                    Find the right technology and accessories to make every
                                    experience better.
                                </p>

                            </div>

                            <div className="col-lg-4 text-lg-end">

                                <Link className="btn btn-light" to="/shop">
                                    Shop gaming &amp; tech
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

        </div>
    )
}
