
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'

export default function Orders() {
const [orders,setOrders] = useState([])
const [search,setSearch] = useState('')
const [status,setStatus] = useState('All statuses')
const [actionLoading,setActionLoading] = useState(null)
const fetchorders = () => {
axios.get(`${host}/order/vieworder`
//   ,{
// headers: {
// Authorization: `Bearer ${token}`
// }
// }
)
.then((res) => {
  console.log('All orders:', res.data.allorder)
  setOrders(res.data.allorder || [])
})
.catch((error)=>{
console.log(error)
alert(error.response?.data?.message || 'Error Fetching Orders')
})
}

useEffect(()=>{
fetchorders()
},[])

const updateorder = (oid,orderStatus) => {
axios.put(`${host}/order/updateorderstatus/${oid}`
  ,{
orderStatus: orderStatus
}
// ,{
// headers: {
// Authorization: `Bearer ${token}`
// }
// }
)
.then((res)=>{
console.log(res)
fetchorders()
alert('Order Status Updated Successfully')
})
.catch((error)=>{
console.log(error)
alert(error.response?.data?.message || 'Error Updating Order Status')
fetchorders()
})
}

const reviewreturn = async (order, decision) => {
  const prompt = decision === 'approve'
    ? 'Confirm the returned item has been received and approve the return? Any captured Razorpay payment will be refunded.'
    : 'Reject this return request?'

  if (!window.confirm(prompt)) return

  const token = localStorage.getItem('adminstoken')
  if (!token) {
    alert('Please login as an admin')
    return
  }

  try {
    setActionLoading(order._id)
    const res = await axios.put(
      `${host}/order/reviewreturn/${order._id}`,
      { decision },
      { headers: { Authorization: 'Bearer ' + token } }
    )
    alert(res.data.message || 'Return request updated')
    fetchorders()
  } catch (error) {
    alert(error.response?.data?.message || 'Unable to review return request')
    fetchorders()
  } finally {
    setActionLoading(null)
  }
}

const completemanualrefund = async (order) => {
  if (!window.confirm('Confirm that the COD refund has been paid to the customer?')) return

  const token = localStorage.getItem('adminstoken')
  if (!token) {
    alert('Please login as an admin')
    return
  }

  try {
    setActionLoading(order._id)
    const res = await axios.put(
      `${host}/order/completemanualrefund/${order._id}`,
      {},
      { headers: { Authorization: 'Bearer ' + token } }
    )
    alert(res.data.message || 'Manual refund completed')
    fetchorders()
  } catch (error) {
    alert(error.response?.data?.message || 'Unable to complete manual refund')
    fetchorders()
  } finally {
    setActionLoading(null)
  }
}

const filteredorders = orders.filter((order)=>{
const customername = order.customer?.name || order.customer?.email || ''
const orderid = order._id || ''
const matchesSearch = customername.toLowerCase().includes(search.toLowerCase()) ||
orderid.toLowerCase().includes(search.toLowerCase())


const matchesStatus = status === 'All statuses' || order.orderStatus === status

return matchesSearch && matchesStatus

})
const orderPagination = useTablePagination(filteredorders)

const processing = orders.filter((order)=>['Placed','Confirmed','Packed'].includes(order.orderStatus)).length
const shipped = orders.filter((order)=>['Shipped','Out for Delivery'].includes(order.orderStatus)).length
const delivered = orders.filter((order)=>order.orderStatus === 'Delivered').length

const getstatusclass = (orderStatus) => {
if(orderStatus === 'Delivered') return 'badge bg-success-subtle text-success'
if(orderStatus === 'Cancelled' || orderStatus === 'Returned') return 'badge bg-danger-subtle text-danger'
if(orderStatus === 'Shipped' || orderStatus === 'Out for Delivery') return 'badge bg-info-subtle text-info'
return 'badge bg-warning-subtle text-warning'
}

return (
  <div className="orders-page">
    <main id="content" className="content orders-screen">
      <div className="container-fluid">
        <section className="orders-hero d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="page-kicker">ORDER MANAGEMENT</span>
            <h1 className="fs-3 mb-1">Manage Orders</h1>
            <p className="mb-0">Track customer orders and update fulfillment status.</p>
          </div>
          <div className="orders-hero-art" aria-hidden="true">
            <div className="orders-art-orbit orders-art-orbit-one" />
            <div className="orders-art-orbit orders-art-orbit-two" />
            <div className="orders-art-platform" />
            <div className="orders-art-bag"><i className="ti ti-shopping-bag" /></div>
            <div className="orders-art-chart"><i className="ti ti-trending-up" /></div>
            <span className="orders-art-spark orders-art-spark-one">✦</span>
            <span className="orders-art-spark orders-art-spark-two">✦</span>
          </div>
          <span className="orders-live-label"><i className="ti ti-chart-line me-1" /> Order overview</span>
        </section>

        <div className="row g-3 mb-4 orders-stat-grid">
          <div className="col-xl-3 col-md-6">
            <div className="card stat-card orders-stat orders-stat-all">
              <span className="orders-stat-icon"><i className="ti ti-shopping-bag" /></span>
              <div><small>All Orders</small><h3 className="mb-0 mt-1">{orders.length}</h3></div>
              <span className="orders-stat-sparkline" aria-hidden="true" />
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card stat-card orders-stat orders-stat-processing">
              <span className="orders-stat-icon"><i className="ti ti-package" /></span>
              <div><small>Processing</small><h3 className="mb-0 mt-1">{processing}</h3></div>
              <span className="orders-stat-sparkline" aria-hidden="true" />
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card stat-card orders-stat orders-stat-shipped">
              <span className="orders-stat-icon"><i className="ti ti-truck-delivery" /></span>
              <div><small>Shipped</small><h3 className="mb-0 mt-1">{shipped}</h3></div>
              <span className="orders-stat-sparkline" aria-hidden="true" />
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card stat-card orders-stat orders-stat-delivered">
              <span className="orders-stat-icon"><i className="ti ti-circle-check" /></span>
              <div><small>Delivered</small><h3 className="mb-0 mt-1">{delivered}</h3></div>
              <span className="orders-stat-sparkline" aria-hidden="true" />
            </div>
          </div>
        </div>

        <section className="card orders-table-panel">
          <div className="card-body border-bottom orders-filters">
            <div className="row g-2">
              <div className="col-lg-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="ti ti-search text-secondary" /></span>
                  <input
                    className="form-control border-start-0 ps-0"
                    placeholder="Search order or customer..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      orderPagination.setPage(1)
                    }}
                    aria-label="Search order or customer"
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <select className="form-select" value={status} onChange={(e) => {
                  setStatus(e.target.value)
                  orderPagination.setPage(1)
                }} aria-label="Filter by order status">
                  <option>All statuses</option>
                  <option>Placed</option>
                  <option>Confirmed</option>
                  <option>Packed</option>
                  <option>Shipped</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                  <option>Returned</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 admin-table">
              <thead className="table-light">
                <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th className="text-end">Action</th></tr>
              </thead>
              <tbody>
                {orderPagination.pageItems.map((order, index) => (
                  <tr key={order._id} className="orders-row" style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}>
                    <td className="fw-semibold order-number">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div className="order-customer">{order.customer?.name || order.customer?.email || 'Customer'}</div>
                      {order.customer?.name && order.customer?.email && <small className="order-subtext">{order.customer.email}</small>}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="fw-semibold order-total">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</div>
                      {order.deliveryCharge !== undefined && (
                        <small className="order-subtext">
                          {Number(order.deliveryCharge) === 0
                            ? 'Free delivery'
                            : `Includes ₹${Number(order.deliveryCharge).toLocaleString('en-IN')} delivery`}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className={getstatusclass(order.orderStatus)}>{order.orderStatus}</span>
                      {order.returnRequest?.status && order.returnRequest.status !== 'None' && (
                        <div className="return-details mt-2">
                          <strong>Return: {order.returnRequest.status}</strong>
                          {order.returnRequest.reason && <div>{order.returnRequest.reason}</div>}
                          {order.refundStatus && order.refundStatus !== 'Not required' && <div>Refund: {order.refundStatus}</div>}
                        </div>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex flex-column align-items-end gap-2">
                        <select
                          className="form-select form-select-sm w-auto order-status-select"
                          value={order.orderStatus}
                          onChange={(e) => updateorder(order._id, e.target.value)}
                          aria-label={`Update status for order ${order._id.slice(-6)}`}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          {['Cancelled', 'Returned'].includes(order.orderStatus) && <option value={order.orderStatus}>{order.orderStatus}</option>}
                        </select>
                        {order.returnRequest?.status === 'Pending' && (
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={actionLoading === order._id}
                              onClick={() => reviewreturn(order, 'approve')}
                            >
                              Approve &amp; refund
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              disabled={actionLoading === order._id}
                              onClick={() => reviewreturn(order, 'reject')}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {order.refundStatus === 'Manual processing' && (
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            disabled={actionLoading === order._id}
                            onClick={() => completemanualrefund(order)}
                          >
                            Mark COD refunded
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredorders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="orders-empty text-center py-5">
                      <span className="orders-empty-icon"><i className="ti ti-package-off" /></span>
                      <div className="fw-semibold mt-2">No orders found</div>
                      <small>Try adjusting your search or status filter.</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            totalItems={filteredorders.length}
            page={orderPagination.page}
            pageCount={orderPagination.pageCount}
            pageSize={orderPagination.pageSize}
            onPageChange={orderPagination.setPage}
            onPageSizeChange={orderPagination.setPageSize}
          />
        </section>
      </div>
    </main>
  </div>
)
}
