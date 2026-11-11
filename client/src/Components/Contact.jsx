import { host } from '../Context/Host.jsx'

import React, { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    message: "",
    type: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({
      loading: true,
      message: "",
      type: "",
    });

    try {
      const response = await fetch(
        `${host}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit message.");
      }

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setStatus({
        loading: false,
        message: data.message,
        type: data.emailSent === false ? "warning" : "success",
      });
    } catch (error) {
      setStatus({
        loading: false,
        message:
          error.message ||
          "Unable to send your message. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <>
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <span className="contact-eyebrow">
              <i className="bi bi-headset"></i> WE ARE HERE TO HELP
            </span>

            <h1>
              Let's start a <span>conversation.</span>
            </h1>

            <p>
              Have a question, need assistance, or just want to say hello?
              Our friendly team is always ready to help you.
            </p>

            <div className="contact-hero-info">
              <span>
                <i className="bi bi-shield-check"></i>
                Trusted Support
              </span>
              <span>
                <i className="bi bi-chat-dots"></i>
                Quick Response
              </span>
            </div>
          </div>

          <div className="contact-hero-decoration">
            <div className="contact-decoration-circle"></div>
            <div className="contact-decoration-circle second"></div>
            <div className="contact-decoration-icon">
              <i className="bi bi-envelope-paper-heart"></i>
            </div>
          </div>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <div className="row g-5">

            <div className="col-lg-7">
              <div className="contact-form-card">
                <div className="contact-form-heading">
                  <span className="eyebrow">GET IN TOUCH</span>
                  <h2>Send us a message</h2>
                  <p>
                    Fill out the form below and we'll get back to you as soon
                    as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">

                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label">
                        Your Name
                      </label>
                      <div className="contact-input-group">
                        <i className="bi bi-person"></i>
                        <input
                          id="name"
                          name="name"
                          className="form-control"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleChange}
                          maxLength={100}
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <div className="contact-input-group">
                        <i className="bi bi-envelope"></i>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          className="form-control"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          maxLength={254}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="subject" className="form-label">
                        Subject
                      </label>
                      <div className="contact-input-group">
                        <i className="bi bi-chat-left-text"></i>
                        <input
                          id="subject"
                          name="subject"
                          className="form-control"
                          placeholder="What is this regarding?"
                          value={formData.subject}
                          onChange={handleChange}
                          maxLength={200}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="message" className="form-label">
                        Your Message
                      </label>
                      <div className="contact-input-group contact-textarea-group">
                        <i className="bi bi-pencil-square"></i>
                        <textarea
                          id="message"
                          name="message"
                          className="form-control"
                          placeholder="Tell us how we can help you..."
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          maxLength={5000}
                          required
                        />
                      </div>
                      <small className="contact-helper-text">
                        We're happy to hear from you. Share as much detail as
                        you need.
                      </small>
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="contact-submit-btn"
                        disabled={status.loading}
                      >
                        {status.loading
                          ? "Sending your message..."
                          : "Send Message"}

                        <i className={`bi ${status.loading ? "bi-hourglass-split" : "bi-arrow-right"}`}></i>
                      </button>
                    </div>

                    {status.message && (
                      <div className="col-12" role="status" aria-live="polite">
                        <div
                          className={`contact-status-message ${status.type}`}
                        >
                          <i className={`bi ${
                            status.type === "success"
                              ? "bi-check-circle-fill"
                              : status.type === "warning"
                              ? "bi-exclamation-circle-fill"
                              : "bi-x-circle-fill"
                          }`}></i>
                          {status.message}
                        </div>
                      </div>
                    )}

                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="contact-info-content">
                <span className="eyebrow">CONTACT INFORMATION</span>
                <h2>We're always happy to help.</h2>
                <p className="contact-info-description">
                  Your shopping experience matters to us. Reach out whenever
                  you need help with an order, product, or anything else.
                </p>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <i className="bi bi-envelope-heart"></i>
                  </div>
                  <div>
                    <h5>Email Support</h5>
                    <p>support@novacart.example</p>
                    <small>Send us your questions anytime</small>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div>
                    <h5>Working Hours</h5>
                    <p>Monday – Saturday</p>
                    <small>9:00 AM – 6:00 PM</small>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <i className="bi bi-chat-square-heart"></i>
                  </div>
                  <div>
                    <h5>Customer Care</h5>
                    <p>We're here for you</p>
                    <small>Dedicated support for every customer</small>
                  </div>
                </div>

                <div className="contact-support-note">
                  <i className="bi bi-stars"></i>
                  <div>
                    <b>Your satisfaction is our priority.</b>
                    <p>Thank you for choosing QuickSell!</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
