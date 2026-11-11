import { host } from '../../../client/src/Context/Host.jsx'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  

  // Change these paths if your Express routes use different names
  const API = {
    products: '/product/viewproduct',
    categories: '/category/viewcategory',
    customers: '/User/viewusers',
    orders: '/order/vieworder',
    payments: '/payment/viewpayment',
    reviews: '/review/viewallreviews'
  }

  const getToken = () => {
    return (
      localStorage.getItem('Usertoken') ||
      localStorage.getItem('usertoken') ||
      localStorage.getItem('UserToken') ||
      localStorage.getItem('adminstoken') ||
      localStorage.getItem('adminsToken')
    )
  }

  const getArray = (data, keys) => {
    if (Array.isArray(data)) {
      return data
    }

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key]
      }
    }

    return []
  }

  const fetchDashboardData = async () => {
    setLoading(true)

    try {
      const token = getToken()

      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {}

      const results = await Promise.allSettled([
        axios.get(host + API.products, config),
        axios.get(host + API.categories, config),
        axios.get(host + API.customers, config),
        axios.get(host + API.orders, config),
        axios.get(host + API.payments, config),
        axios.get(host + API.reviews, config)
      ])

      const productData =
        results[0].status === 'fulfilled'
          ? getArray(results[0].value.data, [
              'allproduct',
              'products',
              'product'
            ])
          : []

      const categoryData =
        results[1].status === 'fulfilled'
          ? getArray(results[1].value.data, [
              'allcategory',
              'categories',
              'category'
            ])
          : []

      const customerData =
        results[2].status === 'fulfilled'
          ? getArray(results[2].value.data, [
              'alluser',
              'allusers',
              'allcustomer',
              'customers',
              'users'
            ])
          : []

      const orderData =
        results[3].status === 'fulfilled'
          ? getArray(results[3].value.data, [
              'allorder',
              'allorders',
              'orders',
              'order'
            ])
          : []

      const paymentData =
        results[4].status === 'fulfilled'
          ? getArray(results[4].value.data, [
              'allpayment',
              'allpayments',
              'payments',
              'payment'
            ])
          : []

      const reviewData =
        results[5].status === 'fulfilled'
          ? getArray(results[5].value.data, [
              'allreviews',
              'allreview',
              'reviews',
              'review'
            ])
          : []

      setProducts(productData)
      setCategories(categoryData)
      setCustomers(customerData)
      setOrders(orderData)
      setPayments(paymentData)
      setReviews(reviewData)

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(
            'Dashboard API error:',
            Object.keys(API)[index],
            result.reason?.response?.data || result.reason?.message
          )
        }
      })
    } catch (error) {
      console.log(
        'Dashboard error:',
        error.response?.data || error.message
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const totalCustomers = customers.length
  const totalProducts = products.length
  const totalStock = products.reduce(
    (total, product) => total + (Number(product.stock) || 0),
    0
  )
  const totalOrders = orders.length

  const activeCategories = categories.filter(
    (category) =>
      category.isActive === true ||
      category.status === 'Active' ||
      category.status === 'active'
  ).length

  const getStatus = (item) =>
    String(
      item.status ||
      item.paymentStatus ||
      item.orderStatus ||
      ''
    ).toLowerCase()

  const successfulPaymentList = payments.filter((payment) =>
    ['success', 'successful', 'completed', 'paid'].includes(
      getStatus(payment)
    )
  )

  const successfulPaymentCount = successfulPaymentList.length

  const paymentRevenue = successfulPaymentList.reduce(
    (total, payment) =>
      total +
      (Number(
        payment.amount ??
        payment.totalAmount ??
        payment.total ??
        payment.price ??
        0
      ) || 0),
    0
  )

  const orderRevenue = orders.reduce((total, order) => {
    const status = getStatus(order)

    if (['cancelled', 'canceled', 'failed'].includes(status)) {
      return total
    }

    return (
      total +
      (Number(
        order.totalAmount ??
        order.totalPrice ??
        order.grandTotal ??
        order.total ??
        0
      ) || 0)
    )
  }, 0)

  const totalRevenue =
    paymentRevenue > 0 ? paymentRevenue : orderRevenue

  const deliveredOrders = orders.filter((order) =>
    ['delivered', 'completed'].includes(getStatus(order))
  ).length

  const pendingOrders = orders.filter((order) =>
    ['pending', 'processing', 'confirmed'].includes(getStatus(order))
  ).length

  const cancelledOrders = orders.filter((order) =>
    ['cancelled', 'canceled'].includes(getStatus(order))
  ).length

  const getCustomerName = (order) => {
    const customer =
      order.customer ||
      order.user ||
      order.userId ||
      order.customerId ||
      {}

    if (typeof customer === 'string') {
      return order.customerName || 'Customer'
    }

    return (
      order.customerName ||
      customer.name ||
      customer.uname ||
      order.shippingAddress?.fname ||
      'Customer'
    )
  }

  const getOrderTotal = (order) =>
    Number(
      order.totalAmount ??
      order.totalPrice ??
      order.grandTotal ??
      order.total ??
      0
    )

  const getOrderId = (order) =>
    order.orderId ||
    order._id ||
    order.id ||
    'N/A'

  const getProductImage = (product) => {
    const image = Array.isArray(product.image)
      ? product.image[0]
      : product.image

    if (!image) {
      return '/assets/img/product-1.png'
    }

    if (image.startsWith('http')) {
      return image
    }

    return `${host}/image/${image}`
  }

  const topProducts = [...products]
    .sort(
      (a, b) =>
        (Number(b.stock) || 0) - (Number(a.stock) || 0)
    )
    .slice(0, 3)

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.date || 0) -
        new Date(a.createdAt || a.date || 0)
    )
  const recentOrderPagination = useTablePagination(recentOrders)

  const getStatusClass = (status) => {
    const value = String(status || 'Pending').toLowerCase()

    if (['delivered', 'completed', 'success', 'successful', 'paid'].includes(value)) {
      return 'bg-success-subtle text-success'
    }

    if (['processing', 'pending', 'confirmed'].includes(value)) {
      return 'bg-warning-subtle text-warning'
    }

    if (['shipped', 'dispatched'].includes(value)) {
      return 'bg-info-subtle text-info'
    }

    if (['cancelled', 'canceled', 'failed'].includes(value)) {
      return 'bg-danger-subtle text-danger'
    }

    return 'bg-secondary-subtle text-secondary'
  }

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))

    return date
  })

  const salesData = lastSevenDays.map((date) => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dailyOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt || order.date || 0)

      return orderDate >= date && orderDate < nextDate
    })

    const revenue = dailyOrders.reduce(
      (total, order) => total + getOrderTotal(order),
      0
    )

    return {
      label: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      }),
      count: dailyOrders.length,
      revenue
    }
  })

  const maxRevenue = Math.max(
    ...salesData.map((item) => item.revenue),
    1
  )

  const reviewCountToday = reviews.filter((review) => {
    const reviewDate = new Date(review.createdAt || review.date || 0)
    const today = new Date()

    return (
      reviewDate.getDate() === today.getDate() &&
      reviewDate.getMonth() === today.getMonth() &&
      reviewDate.getFullYear() === today.getFullYear()
    )
  }).length

  return (
    <div>
      <div>
        <div id="overlay" className="overlay" />

        {/* SIDEBAR */}

        {/* MAIN CONTENT */}
        <main id="content" className="content">
          <div className="container-fluid dashboard-page">

            <div className="admin-hero dashboard-hero mb-4">
              <div>
                <span className="hero-kicker">NOVACART ADMIN</span>
                <h1 className="fs-3 mb-1">Store Control Center</h1>
                <p className="mb-0">
                  Monitor customers, products, orders, payments and reviews from one place.
                </p>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary px-3"
                  onClick={fetchDashboardData}
                  disabled={loading}
                >
                  <i className="ti ti-refresh me-1" />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>

                <a href="/addproduct" className="btn btn-primary dashboard-add-button px-4">
                  <i className="ti ti-plus me-1" />
                  Add Product
                </a>
              </div>
            </div>

            <div className="row g-3 mb-4 dashboard-stats-row">

              <div className="col-xl-3 col-md-6 col-12">
                <div className="card stat-card dashboard-stat-card dashboard-stat-customers h-100 p-4">
                  <div className="d-flex gap-3 align-items-center">
                    <div className="icon-shape icon-md bg-primary text-white rounded-3">
                      <i className="ti ti-users fs-4" />
                    </div>
                    <div>
                      <p className="text-secondary mb-1 small">Total Customers</p>
                      <h3 className="fw-bold mb-1">
                        {loading ? '...' : totalCustomers}
                      </h3>
                      <span className="metric-up">
                        <i className="ti ti-users" /> Registered customers
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 col-12">
                <div className="card stat-card dashboard-stat-card dashboard-stat-products h-100 p-4">
                  <div className="d-flex gap-3 align-items-center">
                    <div className="icon-shape icon-md bg-info text-white rounded-3">
                      <i className="ti ti-box-seam fs-4" />
                    </div>
                    <div>
                      <p className="text-secondary mb-1 small">Total Products</p>
                      <h3 className="fw-bold mb-1">
                        {loading ? '...' : totalProducts}
                      </h3>
                      <span className="metric-up">
                        <i className="ti ti-circle-check" /> {totalStock} units in stock
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 col-12">
                <div className="card stat-card dashboard-stat-card dashboard-stat-orders h-100 p-4">
                  <div className="d-flex gap-3 align-items-center">
                    <div className="icon-shape icon-md bg-success text-white rounded-3">
                      <i className="ti ti-shopping-cart fs-4" />
                    </div>
                    <div>
                      <p className="text-secondary mb-1 small">Total Orders</p>
                      <h3 className="fw-bold mb-1">
                        {loading ? '...' : totalOrders}
                      </h3>
                      <span className="metric-up">
                        <i className="ti ti-clock" /> {pendingOrders} pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 col-12">
                <div className="card stat-card dashboard-stat-card dashboard-stat-revenue h-100 p-4">
                  <div className="d-flex gap-3 align-items-center">
                    <div className="icon-shape icon-md bg-warning text-white rounded-3">
                      <i className="ti ti-currency-rupee fs-4" />
                    </div>
                    <div>
                      <p className="text-secondary mb-1 small">Successful Payments</p>
                      <h3 className="fw-bold mb-1">
                        {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`}
                      </h3>
                      <span className="metric-up">
                        <i className="ti ti-shield-check" /> {successfulPaymentCount} successful transactions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="row g-3 mb-4 dashboard-content-row">

              <div className="col-xl-8 col-12">
                <div className="card dashboard-panel dashboard-chart-panel h-100">
                  <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="mb-1 fs-5">Sales Performance</h2>
                      <p className="mb-0 small text-secondary">
                        Revenue and order activity for the last 7 days
                      </p>
                    </div>
                    <a href="/payments" className="btn btn-outline-primary btn-sm">
                      Payment Overview
                    </a>
                  </div>

                  <div className="card-body">
                    {orders.length > 0 ? (
                      <div>
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <small className="text-secondary">Orders</small>
                            <h4 className="mb-0">{totalOrders}</h4>
                          </div>
                          <div className="text-end">
                            <small className="text-secondary">Order revenue</small>
                            <h4 className="mb-0">
                              ₹{orderRevenue.toLocaleString('en-IN')}
                            </h4>
                          </div>
                        </div>

                        <div className="d-flex align-items-end gap-3 dashboard-sales-bars" style={{ height: '210px' }}>
                          {salesData.map((item, index) => (
                            <div
                              key={item.label}
                              className="d-flex flex-column align-items-center justify-content-end flex-grow-1 h-100 dashboard-sales-column"
                              style={{ animationDelay: `${index * 70}ms` }}
                              title={`${item.count} orders, ₹${item.revenue.toLocaleString('en-IN')}`}
                            >
                              <small className="text-secondary mb-1">
                                {item.count}
                              </small>
                              <div
                                className="bg-primary rounded-top w-100 dashboard-sales-bar"
                                style={{
                                  height: `${Math.max((item.revenue / maxRevenue) * 150, item.count > 0 ? 8 : 3)}px`,
                                  minHeight: '3px'
                                }}
                              />
                              <small className="text-secondary mt-2">
                                {item.label}
                              </small>
                            </div>
                          ))}
                        </div>

                        <div className="d-flex flex-wrap gap-3 mt-4">
                          <span className="badge bg-success-subtle text-success">
                            Delivered: {deliveredOrders}
                          </span>
                          <span className="badge bg-warning-subtle text-warning">
                            Processing: {pendingOrders}
                          </span>
                          <span className="badge bg-danger-subtle text-danger">
                            Cancelled: {cancelledOrders}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-secondary py-5">
                        <i className="ti ti-chart-bar fs-1 d-block mb-3" />
                        {loading
                          ? 'Loading sales data...'
                          : 'No order data available. Check your order API.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-12">
                <div className="card dashboard-panel dashboard-tasks-panel h-100">
                  <div className="card-header bg-transparent">
                    <h2 className="mb-0 fs-5">Admin Tasks</h2>
                  </div>

                  <div className="card-body">

                    <div className="task-item">
                      <div className="task-icon bg-primary-subtle text-primary">
                        <i className="ti ti-users" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">Customers</div>
                        <small className="text-secondary">
                          Manage {totalCustomers} accounts
                        </small>
                      </div>
                      <a href="/users" className="btn btn-sm btn-light">Open</a>
                    </div>

                    <div className="task-item">
                      <div className="task-icon bg-info-subtle text-info">
                        <i className="ti ti-category" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">Categories</div>
                        <small className="text-secondary">
                          {activeCategories} active categories
                        </small>
                      </div>
                      <a href="/category" className="btn btn-sm btn-light">Open</a>
                    </div>

                    <div className="task-item">
                      <div className="task-icon bg-success-subtle text-success">
                        <i className="ti ti-credit-card" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">Payments</div>
                        <small className="text-secondary">
                          {payments.length} transactions
                        </small>
                      </div>
                      <a href="/payment" className="btn btn-sm btn-light">Open</a>
                    </div>

                    <div className="task-item">
                      <div className="task-icon bg-warning-subtle text-warning">
                        <i className="ti ti-star" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">Reviews</div>
                        <small className="text-secondary">
                          {reviewCountToday} new reviews today
                        </small>
                      </div>
                      <a href="/review" className="btn btn-sm btn-light">Open</a>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            <div className="row g-3 dashboard-content-row">

              <div className="col-xl-7 col-12">
                <div className="card dashboard-panel dashboard-orders-panel">
                  <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="mb-0 fs-5">Recent Orders</h2>
                      <small className="text-secondary">Latest customer purchases</small>
                    </div>
                    <a href="/orders" className="btn btn-sm btn-light">
                      View all
                    </a>
                  </div>

                  <div className="table-responsive">
                    <table className="table mb-0 align-middle admin-table">
                      <thead className="table-light">
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentOrders.length > 0 ? (
                          recentOrderPagination.pageItems.map((order) => (
                            <tr key={order._id || order.orderId}>
                              <td className="fw-semibold">
                                #{String(getOrderId(order)).slice(-6)}
                              </td>
                              <td>{getCustomerName(order)}</td>
                              <td>
                                ₹{getOrderTotal(order).toLocaleString('en-IN')}
                              </td>
                              <td>
                                <span className={`badge ${getStatusClass(order.status || order.orderStatus)}`}>
                                  {order.status || order.orderStatus || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-secondary py-4">
                              {loading
                                ? 'Loading recent orders...'
                                : 'No orders found. Check your order API.'}
                            </td>
                          </tr>
                        )}
                      </tbody>

                    </table>
                  </div>
                  <TablePagination
                    totalItems={recentOrders.length}
                    page={recentOrderPagination.page}
                    pageCount={recentOrderPagination.pageCount}
                    pageSize={recentOrderPagination.pageSize}
                    onPageChange={recentOrderPagination.setPage}
                    onPageSizeChange={recentOrderPagination.setPageSize}
                  />
                </div>
              </div>

              <div className="col-xl-5 col-12">
                <div className="card dashboard-panel dashboard-products-panel">
                  <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="mb-0 fs-5">Top Products</h2>
                      <small className="text-secondary">Best performing inventory</small>
                    </div>
                    <a href="/products" className="btn btn-sm btn-light">
                      Manage
                    </a>
                  </div>

                  <div className="card-body p-0">
                    <div className="list-group list-group-flush">

                      {topProducts.length > 0 ? (
                        topProducts.map((product) => (
                          <div
                            key={product._id}
                            className="list-group-item d-flex align-items-center gap-3 py-3 dashboard-product-row"
                          >
                            <img
                              src={getProductImage(product)}
                              width={46}
                              height={46}
                              className="rounded-3 product-thumb"
                              style={{ objectFit: 'cover' }}
                              alt={product.name || 'Product'}
                              onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src = '/assets/img/product-1.png'
                              }}
                            />

                            <div className="flex-grow-1">
                              <h6 className="mb-1">
                                {product.name || 'Unnamed Product'}
                              </h6>
                              <small className="text-secondary">
                                {Number(product.stock) || 0} in stock
                              </small>
                            </div>

                            <strong>
                              ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-secondary py-4">
                          {loading ? 'Loading products...' : 'No products found.'}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
