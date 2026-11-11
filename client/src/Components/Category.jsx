import { host } from '../Context/Host.jsx'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Category() {
  const [category, setCategory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchcategory = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${host}/category/viewcategory`)
      setCategory(Array.isArray(response.data.allcategory) ? response.data.allcategory : [])
    } catch (requestError) {
      console.error('Category fetch error:', requestError.response?.data || requestError.message)
      setError("We couldn't load the collections right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchcategory()
  }, [])

  return (
    <main className="category-page">
      <section className="category-hero">
        <div className="container category-hero-layout">
          <div className="category-hero-copy">
            <span className="eyebrow">
              <i className="bi bi-stars" aria-hidden="true"></i>
              DISCOVER YOUR STYLE
            </span>
            <h1 className="mt-3">
              Find your next <span>favourite.</span>
            </h1>
            <p>
              Thoughtfully grouped collections make it easier to find the
              things you love, all in one place.
            </p>
            <div className="category-hero-actions">
              <a className="category-hero-button" href="#category-grid">
                Explore collections
                <i className="bi bi-arrow-down" aria-hidden="true"></i>
              </a>
              <span className="category-hero-note">
                <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                Curated for everyday
              </span>
            </div>
          </div>

          <div className="category-hero-art" aria-hidden="true">
            <div className="category-art-orbit category-art-orbit-one"></div>
            <div className="category-art-orbit category-art-orbit-two"></div>
            <div className="category-art-card category-art-card-main">
              <span className="category-art-icon"><i className="bi bi-grid-1x2-fill"></i></span>
              <span className="category-art-label">Made for discovery</span>
              <strong>Find something<br />wonderful.</strong>
              <span className="category-art-dots"><i></i><i></i><i></i></span>
            </div>
            <div className="category-art-card category-art-card-float">
              <i className="bi bi-bag-heart-fill"></i>
              <span>Good finds<br /><b>start here</b></span>
            </div>
            <span className="category-art-spark category-art-spark-one"><i className="bi bi-stars"></i></span>
            <span className="category-art-spark category-art-spark-two"><i className="bi bi-plus-lg"></i></span>
          </div>
        </div>
        <div className="category-hero-circle"></div>
        <div className="category-hero-circle second"></div>
      </section>

      <section className="section category-section" id="category-grid">
        <div className="container">
          <div className="category-heading">
            <div>
              <span className="eyebrow">THE QUICKSELL EDIT</span>
              <h2>Explore collections</h2>
              <p>A little inspiration for whatever you&apos;re looking for.</p>
            </div>
            <div className="category-count" aria-live="polite">
              <i className="bi bi-grid" aria-hidden="true"></i>
              <span>{category.length} {category.length === 1 ? 'Collection' : 'Collections'}</span>
            </div>
          </div>

          {loading ? (
            <div className="category-loading" role="status">
              <span className="category-loading-spinner"></span>
              <span>Gathering collections for you...</span>
            </div>
          ) : error ? (
            <div className="category-empty category-error" role="alert">
              <i className="bi bi-cloud-exclamation"></i>
              <h4>Collections are taking a moment</h4>
              <p>{error}</p>
              <button type="button" className="category-retry-button" onClick={fetchcategory}>
                Try again <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
              </button>
            </div>
          ) : category.length > 0 ? (
            <div className="row g-4 category-grid">
              {category.map((cat, index) => (
                <div
                  className="col-md-6 col-lg-4"
                  key={cat._id}
                  style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}
                >
                  <article className="category-card">
                    <div className="category-image">
                      <img
                        src={
                          cat.image
                            ? `${host}/image/${cat.image}`
                            : '/assets/img/product-1.png'
                        }
                        alt={cat.name || cat.cname}
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = '/assets/img/product-1.png'
                        }}
                      />
                      <div className="category-image-overlay"></div>
                      <span className="category-badge">
                        <i className="bi bi-sparkle" aria-hidden="true"></i>
                        COLLECTION
                      </span>
                      <div className="category-card-icon" aria-hidden="true">
                        <i className="bi bi-grid-fill"></i>
                      </div>
                    </div>

                    <div className="category-card-body">
                      <h3>{cat.name || cat.cname}</h3>
                      <p>
                        {cat.description || cat.cdesc || 'Explore our collection and discover quality products selected for you.'}
                      </p>
                      <Link className="category-link" to={`/shop?category=${cat._id}`}>
                        Browse collection
                        <i className="bi bi-arrow-right" aria-hidden="true"></i>
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <div className="category-empty">
              <i className="bi bi-grid"></i>
              <h4>Your next discovery is on its way</h4>
              <p>Our collections will appear here soon. Please check back shortly.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
