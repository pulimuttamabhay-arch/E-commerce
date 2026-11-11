import React from 'react'
import { Link } from 'react-router-dom'

const principles = [
  { icon: 'bi-stars', number: '01', title: 'Curated selection', text: 'Thoughtful collections that make discovery easier.' },
  { icon: 'bi-tag', number: '02', title: 'Clear pricing', text: 'Straightforward prices, with no guesswork.' },
  { icon: 'bi-arrow-repeat', number: '03', title: 'Simple returns', text: 'A smoother experience, even after checkout.' },
  { icon: 'bi-headset', number: '04', title: 'Here to help', text: 'Friendly support when you need a hand.' }
]

const values = [
  {
    icon: 'bi-bullseye',
    label: 'OUR MISSION',
    title: 'Make shopping feel simple.',
    text: 'Bring useful products and a smooth, dependable experience together.'
  },
  {
    icon: 'bi-eye',
    label: 'OUR VISION',
    title: 'Help people shop with confidence.',
    text: 'Build a destination where discovering the right product feels easy.'
  },
  {
    icon: 'bi-heart',
    label: 'OUR VALUES',
    title: 'Put people and quality first.',
    text: 'Let transparency, quality and customer satisfaction guide our choices.'
  }
]

export default function About() {
  return (
    <main className="about-v2">
      <section className="about-v2-hero">
        <div className="container about-v2-hero-grid">
          <div className="about-v2-hero-copy">
            <span className="about-v2-eyebrow">
              <i className="bi bi-stars" aria-hidden="true"></i>
              OUR STORY
            </span>
            <h1>
              The joy of finding <span>just the right thing.</span>
            </h1>
            <p>
              We believe a great shopping experience should feel clear,
              considered and genuinely enjoyable—from the first browse to
              the moment your order arrives.
            </p>
            <div className="about-v2-hero-actions">
              <Link to="/shop" className="about-v2-primary-link">
                Explore the shop <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
              </Link>
              <span><i className="bi bi-check2-circle" aria-hidden="true"></i> Thoughtful finds, made simple</span>
            </div>
          </div>

          <div className="about-v2-hero-visual" aria-hidden="true">
            <div className="about-v2-hero-backdrop"></div>
            <div className="about-v2-hero-photo">
              <img src="/assets/img/carousel-1.jpg" alt="" />
            </div>
            <div className="about-v2-floating-card">
              <span className="about-v2-floating-icon"><i className="bi bi-bag-heart-fill"></i></span>
              <span>Shopping, with<br /><strong>you in mind.</strong></span>
            </div>
            <span className="about-v2-orbit-dot about-v2-orbit-dot-one"></span>
            <span className="about-v2-orbit-dot about-v2-orbit-dot-two"></span>
            <span className="about-v2-hero-spark"><i className="bi bi-plus-lg"></i></span>
          </div>
        </div>
        <div className="about-v2-hero-glow"></div>
      </section>

      <section className="about-v2-principles" aria-label="Our commitments">
        <div className="container about-v2-principles-row">
          <span><i className="bi bi-patch-check-fill"></i> Quality products</span>
          <span><i className="bi bi-shield-check"></i> Trusted shopping</span>
          <span><i className="bi bi-lightning-charge-fill"></i> Easy experience</span>
        </div>
      </section>

      <section className="about-v2-story">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 about-v2-story-visual">
              <div className="about-v2-image-frame">
                <img
                  src="/assets/img/carousel-1.jpg"
                  alt="A glimpse of the QuickSell shopping experience"
                  className="about-v2-story-image"
                />
                <div className="about-v2-image-caption">
                  <i className="bi bi-heart-fill" aria-hidden="true"></i>
                  <span><strong>Good finds.</strong><small>Chosen with care</small></span>
                </div>
                <span className="about-v2-image-index">A BETTER WAY · 01</span>
              </div>
            </div>

            <div className="col-lg-6 about-v2-story-copy">
              <span className="about-v2-section-label">WHY QUICKSELL</span>
              <h2>Less noise.<br /><span>More of what matters.</span></h2>
              <p className="about-v2-story-lead">
                We built QuickSell around discovery, clarity and trust.
                Products are easy to explore, details are simple to understand,
                and the path to checkout stays refreshingly straightforward.
              </p>
              <p className="about-v2-story-body">
                Online shopping should fit into your life—not complicate it.
                Our goal is to help you find the right product with confidence,
                every time you visit.
              </p>

              <div className="about-v2-principle-grid">
                {principles.map((principle) => (
                  <article className="about-v2-principle-card" key={principle.number}>
                    <span className="about-v2-principle-icon">
                      <i className={`bi ${principle.icon}`} aria-hidden="true"></i>
                    </span>
                    <span className="about-v2-principle-number">{principle.number}</span>
                    <h3>{principle.title}</h3>
                    <p>{principle.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-v2-values">
        <div className="container">
          <div className="about-v2-values-heading">
            <span className="about-v2-section-label">WHAT GUIDES US</span>
            <h2>A better way to <span>shop online.</span></h2>
            <p>Every detail starts with the experience we want for you.</p>
          </div>
          <div className="row g-4 about-v2-values-grid">
            {values.map((value, index) => (
              <div className="col-md-4" key={value.label} style={{ animationDelay: `${index * 100}ms` }}>
                <article className="about-v2-value-card">
                  <span className="about-v2-value-index">0{index + 1}</span>
                  <span className="about-v2-value-icon">
                    <i className={`bi ${value.icon}`} aria-hidden="true"></i>
                  </span>
                  <span className="about-v2-value-label">{value.label}</span>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                  <span className="about-v2-value-line"></span>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-v2-cta">
        <div className="container">
          <div className="about-v2-cta-panel">
            <div>
              <span className="about-v2-cta-label">YOUR NEXT GREAT FIND</span>
              <h2>Find what you love.<br />Enjoy every moment.</h2>
              <p>Explore the collection and make your next discovery.</p>
            </div>
            <Link to="/shop" className="about-v2-cta-link">
              Explore products <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
            <span className="about-v2-cta-orbit"></span>
          </div>
        </div>
      </section>
    </main>
  )
}
