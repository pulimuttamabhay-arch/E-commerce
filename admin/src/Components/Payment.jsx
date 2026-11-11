
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'

export default function Payment() {
  const [payment, setPayment] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const [selectedpayment, setSelectedpayment] = useState(null)
  const [count,setCount] = useState({
    payment:0
  })

  const fetchcount = async ()=>{
    try{
       const res = await axios.get('http://localhost:7002/payment/Count')
       console.log('Count response',res.data)
        setCount({
      payment:res.data.allPayment   
    })
    } catch(error){
        console.log('Count fetch error:', error.response?.data || error.message)
    }
  }
  const fetchpayment = async () => {
    try {
      const token = localStorage.getItem('Usertoken')

      const res = await axios.get(
        'http://localhost:7002/payment/viewpayment',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setPayment(res.data.allpayment || [])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchpayment()
    fetchcount()
  }, [])

  const filteredpayment = payment.filter((pdata) => {
    const order =
      typeof pdata.order === 'object'
        ? pdata.order
        : null

    const orderid = order?._id || pdata.order || ''

    const customername =
      order?.customer?.name || ''

    const matchessearch =
      (pdata._id || '').toLowerCase().includes(search.toLowerCase()) ||
      String(orderid).toLowerCase().includes(search.toLowerCase()) ||
      customername.toLowerCase().includes(search.toLowerCase())

    const matchesstatus =
      status === '' || pdata.paymentStatus === status

    const matchesmethod =
      method === '' || pdata.paymentMethod === method

    return matchessearch && matchesstatus && matchesmethod
  })
  const paymentPagination = useTablePagination(filteredpayment)

  const totalpayments = payment.length

  const failed = payment.filter(
    (pdata) => pdata.paymentStatus === 'Failed'
  ).length

  const refunded = payment.filter(
    (pdata) => pdata.paymentStatus === 'Refunded'
  ).length
  const paymentShare = (value) => totalpayments
    ? `${((value / totalpayments) * 100).toFixed(1)}% of payments`
    : 'No payments yet'

  return (
    <main id="content" className="content payment-screen">
      <div className="container-fluid payment-page">

        <div className="payment-hero d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="page-kicker">PAYMENT MANAGEMENT</span>
            <h1 className="fs-3 mb-1">Manage Payment</h1>
            <p className="mb-0">
              Monitor payment status, failed transactions and refunds.
            </p>
          </div>
          <div className="payment-hero-art" aria-hidden="true">
            <span className="payment-orbit payment-orbit-one" />
            <span className="payment-orbit payment-orbit-two" />
            <span className="payment-art-coin payment-art-coin-one"><i className="ti ti-currency-rupee" /></span>
            <span className="payment-art-coin payment-art-coin-two"><i className="ti ti-currency-rupee" /></span>
            <div className="payment-art-card">
              <span className="payment-card-chip" />
              <span className="payment-card-contactless"><i className="ti ti-wifi" /></span>
              <span className="payment-card-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 2048</span>
            </div>
            <span className="payment-art-shield"><i className="ti ti-check" /></span>
            <span className="payment-art-spark payment-art-spark-one">✦</span>
            <span className="payment-art-spark payment-art-spark-two">✦</span>
          </div>
          <button
            className="btn payment-export"
            onClick={() => window.print()}
          >
            <i className="ti ti-download me-1" />
            Export
          </button>
        </div>

        <div className="payment-stat-grid row g-3 mb-4">

          <div className="col-md-3">
            <div className="card stat-card payment-stat payment-stat-total p-4">
              <span className="payment-stat-icon"><i className="ti ti-wallet" /></span>
              <div className="payment-stat-copy">
                <small>Total Payments</small>
                <h3 className="mb-0 mt-1">{totalpayments}</h3>
                <span className="payment-stat-note">All recorded transactions</span>
              </div>
              <span className="payment-sparkline" aria-hidden="true" />
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card payment-stat payment-stat-success p-4">
              <span className="payment-stat-icon"><i className="ti ti-circle-check" /></span>
              <div className="payment-stat-copy">
                <small>Successful</small>
                <h3 className="mb-0 mt-1">{count.payment}</h3>
                <span className="payment-stat-note">{paymentShare(count.payment)}</span>
              </div>
              <span className="payment-sparkline" aria-hidden="true" />
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card payment-stat payment-stat-failed p-4">
              <span className="payment-stat-icon"><i className="ti ti-alert-circle" /></span>
              <div className="payment-stat-copy">
                <small>Failed</small>
                <h3 className="mb-0 mt-1">{failed}</h3>
                <span className="payment-stat-note">{paymentShare(failed)}</span>
              </div>
              <span className="payment-sparkline" aria-hidden="true" />
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card payment-stat payment-stat-refund p-4">
              <span className="payment-stat-icon"><i className="ti ti-receipt-refund" /></span>
              <div className="payment-stat-copy">
                <small>Refunds</small>
                <h3 className="mb-0 mt-1">{refunded}</h3>
                <span className="payment-stat-note">{paymentShare(refunded)}</span>
              </div>
              <span className="payment-sparkline" aria-hidden="true" />
            </div>
          </div>

        </div>

        <section className="card payment-table-card">
          <div className="payment-table-heading d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Transactions</h2>
              <p className="mb-0">Review payment activity and transaction status.</p>
            </div>
            <span className="payment-record-count"><i className="ti ti-receipt me-1" />{filteredpayment.length} records</span>
          </div>

          <div className="card-body border-bottom payment-filters">
            <div className="row g-2 align-items-center">

              <div className="col-lg-5">
                <div className="input-group payment-search">
                  <span className="input-group-text"><i className="ti ti-search" /></span>
                  <input
                    className="form-control"
                    placeholder="Search payment, order or customer..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      paymentPagination.setPage(1)
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={status}
                  aria-label="Filter by payment status"
                  onChange={(e) => {
                    setStatus(e.target.value)
                    paymentPagination.setPage(1)
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="Success">Successful</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="col-lg-2">
                <select
                  className="form-select"
                  value={method}
                  aria-label="Filter by payment method"
                  onChange={(e) => {
                    setMethod(e.target.value)
                    paymentPagination.setPage(1)
                  }}
                >
                  <option value="">All methods</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="NetBanking">Net Banking</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              <div className="col-lg-2">
                <button
                  className="btn btn-outline-secondary w-100 payment-clear-filters"
                  onClick={() => {
                    setSearch('')
                    setStatus('')
                    setMethod('')
                    paymentPagination.setPage(1)
                  }}
                >
                  <i className="ti ti-adjustments-horizontal me-1" />
                  Clear
                </button>
              </div>

            </div>
          </div>

          <div className="table-responsive payment-table-wrap">
            <table className="table table-hover align-middle mb-0 admin-table">

              <thead className="table-light">
                <tr>
                  <th>Payment ID</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredpayment.length > 0 ? (
                  paymentPagination.pageItems.map((pdata) => {
                    const order =
                      typeof pdata.order === 'object'
                        ? pdata.order
                        : null

                    const paymentstatus = pdata.paymentStatus || 'Pending'

                    return (
                      <tr key={pdata._id} className="payment-row">
                        <td className="payment-id fw-semibold">
                          <span className={`payment-dot payment-dot-${(paymentstatus || 'pending').toLowerCase()}`} />
                          <span>{pdata._id}</span>
                        </td>

                        <td className="payment-order-id">
                          {order?._id || pdata.order || '-'}
                        </td>

                        <td className="payment-customer">
                          {order?.customer?.name ||
                            pdata.customer?.name ||
                            '-'}
                        </td>

                        <td><span className={`payment-method payment-method-${(pdata.paymentMethod || 'other').toLowerCase()}`}>{pdata.paymentMethod || '-'}</span></td>

                        <td className="payment-amount">
                          ₹{Number(pdata.amount || 0).toLocaleString('en-IN')}
                        </td>

                        <td>
                          <span
                            className={`badge payment-status payment-status-${paymentstatus.toLowerCase()} ${
                              paymentstatus === 'Success'
                                ? 'bg-success-subtle text-success'
                                : paymentstatus === 'Failed'
                                ? 'bg-danger-subtle text-danger'
                                : paymentstatus === 'Refunded'
                                ? 'bg-warning-subtle text-warning'
                                : 'bg-secondary-subtle text-secondary'
                            }`}
                          >
                            {paymentstatus === 'Success'
                              ? 'Successful'
                              : paymentstatus}
                          </span>
                        </td>

                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-light payment-view-button"
                            onClick={() => setSelectedpayment(pdata)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
          <TablePagination
            totalItems={filteredpayment.length}
            page={paymentPagination.page}
            pageCount={paymentPagination.pageCount}
            pageSize={paymentPagination.pageSize}
            onPageChange={paymentPagination.setPage}
            onPageSizeChange={paymentPagination.setPageSize}
          />
        </section>

        {selectedpayment && (
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">Payment Details</h5>

                  <button
                    className="btn-close"
                    onClick={() => setSelectedpayment(null)}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Payment ID:</strong>{' '}
                    {selectedpayment._id}
                  </p>

                  <p>
                    <strong>Order ID:</strong>{' '}
                    {selectedpayment.order?._id ||
                      selectedpayment.order ||
                      '-'}
                  </p>

                  <p>
                    <strong>Customer:</strong>{' '}
                    {selectedpayment.order?.customer?.name ||
                      selectedpayment.customer?.name ||
                      '-'}
                  </p>

                  <p>
                    <strong>Method:</strong>{' '}
                    {selectedpayment.paymentMethod || '-'}
                  </p>

                  <p>
                    <strong>Amount:</strong>{' '}
                    ₹{Number(selectedpayment.amount || 0).toLocaleString('en-IN')}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    {selectedpayment.paymentStatus === 'Success'
                      ? 'Successful'
                      : selectedpayment.paymentStatus || 'Pending'}
                  </p>

                  <p>
                    <strong>Transaction ID:</strong>{' '}
                    {selectedpayment.transactionId || '-'}
                  </p>

                  <p>
                    <strong>Payment Date:</strong>{' '}
                    {selectedpayment.createdAt
                      ? new Date(selectedpayment.createdAt).toLocaleString('en-IN')
                      : '-'}
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedpayment(null)}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
