
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'

const getImageUrl = (image) => {
    const filename = Array.isArray(image) ? image[0] : image

    if (!filename) {
        return ''
    }

    if (filename.startsWith('http')) {
        return filename
    }

    return `http://localhost:7002/image/${filename}`
}

export default function Review() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [ratingFilter, setRatingFilter] = useState('All Ratings')
    const [statusFilter, setStatusFilter] = useState('All Status')

    const fetchreviews = () => {
        setLoading(true)

        axios.get('http://localhost:7002/review/viewallreviews')
            .then((res) => {
                console.log('Review response:', res.data)

                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.allreviews || res.data.reviews || []

                setReviews(Array.isArray(data) ? data : [])
            })
            .catch((error) => {
                console.log('Review fetch error:', error.response?.data || error)
                alert(error.response?.data?.message || 'Unable to load reviews')
                setReviews([])
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchreviews()
    }, [])

    const handleVisibility = async (id, isVisible) => {
        try {
            const res = await axios.put(
                `http://localhost:7002/review/updatereviewvisibility/${id}`,
                { isVisible: !isVisible }
            )

            alert(res.data.message || 'Review status updated')
            fetchreviews()
        } catch (error) {
            console.log('Review update error:', error.response?.data || error)
            alert(error.response?.data?.message || 'Unable to update review')
        }
    }

    const filteredreviews = reviews.filter((review) => {
        const customerName = review.customer?.name || review.customerName || ''
        const productName = review.product?.name || ''
        const comment = review.comment || ''

        const matchesSearch =
            customerName.toLowerCase().includes(search.toLowerCase()) ||
            productName.toLowerCase().includes(search.toLowerCase()) ||
            comment.toLowerCase().includes(search.toLowerCase())

        const matchesRating =
            ratingFilter === 'All Ratings' ||
            Number(review.rating) === Number(ratingFilter)

        const matchesStatus =
            statusFilter === 'All Status' ||
            (statusFilter === 'Published' && review.isVisible === true) ||
            (statusFilter === 'Hidden' && review.isVisible === false)

        return matchesSearch && matchesRating && matchesStatus
    })
    const reviewPagination = useTablePagination(filteredreviews)

    const totalReviews = reviews.length

    const visibleReviews = reviews.filter(
        (review) => review.isVisible === true
    ).length

    const hiddenReviews = reviews.filter(
        (review) => review.isVisible === false
    ).length

    const averageRating = totalReviews > 0
        ? (
            reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
            totalReviews
        ).toFixed(1)
        : '0.0'

    const fiveStarReviews = reviews.filter(
        (review) => Number(review.rating) === 5
    ).length

    return (
        <div>
            <main id="content" className="content reviews-screen">
                <div className="container-fluid reviews-page">

                    <div className="reviews-page-header d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <span className="page-kicker">REVIEW MANAGEMENT</span>
                            <h1 className="fs-3 mb-1">View Reviews</h1>
                            <p className="mb-0">
                                Monitor customer feedback and manage published reviews.
                            </p>
                        </div>
                        <div className="reviews-hero-art" aria-hidden="true">
                            <span className="reviews-art-spark reviews-art-spark-one">✦</span>
                            <span className="reviews-art-spark reviews-art-spark-two">✦</span>
                            <div className="reviews-art-bubble">
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <span className="reviews-art-cube"><i className="ti ti-star-filled" /></span>
                        </div>
                    </div>

                    <div className="reviews-stats row g-3 mb-4">

                        <div className="col-md-3">
                            <div className="card stat-card reviews-stat-card reviews-stat-total p-4">
                                <div className="reviews-stat-icon"><i className="ti ti-message-circle" /></div>
                                <div className="reviews-stat-content">
                                    <small className="text-secondary">Total Reviews</small>
                                    <h3 className="mb-0 mt-1">{totalReviews}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card stat-card reviews-stat-card reviews-stat-average p-4">
                                <div className="reviews-stat-icon"><i className="ti ti-star" /></div>
                                <div className="reviews-stat-content">
                                    <small className="text-secondary">Average Rating</small>
                                    <h3 className="mb-0 mt-1">{averageRating} / 5</h3>
                                    <span className="reviews-stat-stars">★★★★★</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card stat-card reviews-stat-card reviews-stat-five-star p-4">
                                <div className="reviews-stat-icon"><i className="ti ti-star-filled" /></div>
                                <div className="reviews-stat-content">
                                    <small className="text-secondary">5 Star Reviews</small>
                                    <h3 className="mb-0 mt-1">{fiveStarReviews}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card stat-card reviews-stat-card reviews-stat-hidden p-4">
                                <div className="reviews-stat-icon"><i className="ti ti-eye-off" /></div>
                                <div className="reviews-stat-content">
                                    <small className="text-secondary">Hidden Reviews</small>
                                    <h3 className="mb-0 mt-1">{hiddenReviews}</h3>
                                    <span className="reviews-stat-note"><i className="ti ti-alert-circle-filled" /> Needs attention</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="card reviews-table-card">

                        <div className="card-body border-bottom">
                            <div className="reviews-filters row g-2">

                                <div className="col-lg-5">
                                    <div className="input-group reviews-search">
                                        <span className="input-group-text"><i className="ti ti-search" /></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search reviews or customer..."
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value)
                                                reviewPagination.setPage(1)
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-3">
                                    <div className="reviews-select-wrap">
                                        <i className="ti ti-star" aria-hidden="true" />
                                        <select
                                            className="form-select"
                                            value={ratingFilter}
                                            onChange={(e) => {
                                                setRatingFilter(e.target.value)
                                                reviewPagination.setPage(1)
                                            }}
                                        >
                                            <option>All Ratings</option>
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-lg-3">
                                    <div className="reviews-select-wrap">
                                        <i className="ti ti-shield-check" aria-hidden="true" />
                                        <select
                                            className="form-select reviews-status-filter"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value)
                                                reviewPagination.setPage(1)
                                            }}
                                        >
                                            <option>All Status</option>
                                            <option>Published</option>
                                            <option>Hidden</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 admin-table">

                                <thead className="table-light">
                                    <tr>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Rating</th>
                                        <th>Review</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                Loading reviews...
                                            </td>
                                        </tr>
                                    ) : filteredreviews.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                No reviews found
                                            </td>
                                        </tr>
                                    ) : (
                                        reviewPagination.pageItems.map((review) => (
                                            <tr key={review._id}>

                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {review.customer?.profileimage ? (
                                                            <img
                                                                src={getImageUrl(review.customer.profileimage)}
                                                                alt="Customer"
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    objectFit: 'cover'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null
                                                                    e.target.src = '/assets/img/profile.png'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="avatar avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center reviews-customer-initial">
                                                                {(review.customer?.name || review.customerName || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}

                                                        <span className="fw-semibold">
                                                            {review.customer?.name || review.customerName || 'Unknown Customer'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {review.product?.image ? (
                                                            <img
                                                                src={getImageUrl(review.product.image)}
                                                                alt={review.product?.name || 'Product'}
                                                                className="reviews-product-image"
                                                                onError={(e) => {
                                                                    e.target.onerror = null
                                                                    e.target.src = '/assets/img/product-1.png'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="reviews-product-placeholder"><i className="ti ti-package" /></span>
                                                        )}
                                                        <span className="reviews-product-name">{review.product?.name || 'Product unavailable'}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="text-warning">
                                                        {'★'.repeat(Math.min(5, Math.max(0, Number(review.rating) || 0)))}
                                                        {'☆'.repeat(5 - Math.min(5, Math.max(0, Number(review.rating) || 0)))}
                                                    </span>
                                                </td>

                                                <td className="review-text">
                                                    {review.comment || 'No comment'}
                                                </td>

                                                <td>
                                                    {review.createdAt
                                                        ? new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                        : 'N/A'}
                                                </td>

                                                <td>
                                                    {review.isVisible ? (
                                                        <span className="badge bg-success-subtle text-success">
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-danger-subtle text-danger">
                                                            Hidden
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="text-end">
                                                    <button
                                                        className={`btn btn-sm ${review.isVisible
                                                            ? 'btn-outline-danger'
                                                            : 'btn-outline-success'}`}
                                                        onClick={() => handleVisibility(
                                                            review._id,
                                                            review.isVisible
                                                        )}
                                                    >
                                                        {review.isVisible ? 'Hide' : 'Publish'}
                                                    </button>
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>

                            </table>
                        </div>
                        <TablePagination
                            totalItems={filteredreviews.length}
                            page={reviewPagination.page}
                            pageCount={reviewPagination.pageCount}
                            pageSize={reviewPagination.pageSize}
                            onPageChange={reviewPagination.setPage}
                            onPageSizeChange={reviewPagination.setPageSize}
                        />

                    </div>

                </div>
            </main>
        </div>
    )
}
