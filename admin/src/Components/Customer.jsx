
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import Review from './Review'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'

export default function Customer() {

  const [viewuser,setViewuser]=useState([])
  const [count,setcount] = useState({
    users:0,
    review:0,
    products:0,
    orders:0,
    category:0
  })

  const [search,setSearch] = useState('')
  const [statusfilter,setStatusfilter] = useState('All Status')

  const fetcheduser = async (req,res)=>{
    axios.get('http://localhost:7002/User/viewusers')
    .then((res)=>{
      console.log(res)
      setViewuser(res.data.allusers)
      console.log('Customer data:', res.data.allusers)
      console.log(
        'Customer images:',
        res.data.allusers.map(user => ({
          name: user.name,
          profileimage: user.profileimage
        }))
      )
    })
    .catch((error)=>{
      console.log(error)
    })
  }

  const fetchcount = async () => {
    try {
      const res = await axios.get('http://localhost:7002/User/Count')

      console.log('Count response:', res.data)

      setcount({
        orders: res.data.allorder,
        users: res.data.alluser,
        review: res.data.allReview,
        products: res.data.allproduct,
        category: res.data.allcategory
      })

    } catch (error) {
      console.log('Count fetch error:', error.response?.data || error.message)
    }
  }

  const filteredusers = viewuser.filter((udata) => {
    const matchessearch =
      (udata.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (udata.email || '').toLowerCase().includes(search.toLowerCase())

    const userstatus = udata.status || 'Active'

    const matchesstatus =
      statusfilter === 'All Status' || userstatus === statusfilter

    return matchessearch && matchesstatus
  })
  const customerPagination = useTablePagination(filteredusers)

  const handleblock = async (uid) => {
    try {
      const res = await axios.put(
        `http://localhost:7002/User/updatestatus/${uid}`,
        { status: 'Blocked' }
      )

      if (res.data.success) {
        setViewuser((prev) =>
          prev.map((user) =>
            user._id === uid
              ? { ...user, status: 'Blocked' }
              : user
          )
        )
      }
    } catch (error) {
      console.log('Block customer error:', error.response?.data || error.message)
    }
  }

  useEffect(()=>{
    fetcheduser()
    fetchcount()
  },[])

  return (
    <div>
      <main id="content" className="content">
        <div className="container-fluid customer-page">
          <div className="customer-hero d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="page-kicker">CUSTOMER MANAGEMENT</span>
              <h1 className="fs-3 mb-1">Manage Customers</h1>
              <p className="mb-0">View, edit and control NovaCart customer accounts.</p>
            </div>
            <button className="btn btn-primary customer-add-button">
              <i className="ti ti-user-plus me-1" />Add Customer
            </button>
          </div>

          <div className="row g-3 mb-4 customer-stats-row">
            <div className="col-md-4">
              <div className="card stat-card customer-stat-card customer-stat-total p-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="customer-stat-icon"><i className="ti ti-users" /></span>
                  <div>
                    <small className="text-secondary">Total Customers</small>
                    <h3 className="mb-1 mt-1">{count.users}</h3>
                    <span className="small metric-up">+286 new this month</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card customer-stat-card customer-stat-active p-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="customer-stat-icon"><i className="ti ti-user-check" /></span>
                  <div>
                    <small className="text-secondary">Active Customers</small>
                    <h3 className="mb-1 mt-1">
                      {viewuser.filter(user => (user.status || 'Active') === 'Active').length}
                    </h3>
                    <span className="small metric-up">Active accounts</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card customer-stat-card customer-stat-blocked p-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="customer-stat-icon"><i className="ti ti-user-off" /></span>
                  <div>
                    <small className="text-secondary">Blocked Accounts</small>
                    <h3 className="mb-1 mt-1">
                      {viewuser.filter(user => user.status === 'Blocked').length}
                    </h3>
                    <span className="small text-danger">Blocked accounts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card customer-table-panel">
            <div className="customer-filter-panel card-body border-bottom">
              <div className="row g-2">
                <div className="col-lg-5 customer-search-field">
                  <input
                    className="form-control"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      customerPagination.setPage(1)
                    }}
                  />
                </div>

                <div className="col-lg-3 customer-status-field">
                  <select
                    className="form-select"
                    value={statusfilter}
                    onChange={(e) => {
                      setStatusfilter(e.target.value)
                      customerPagination.setPage(1)
                    }}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Blocked</option>
                  </select>
                </div>

                <div className="col-lg-2 customer-reset-field">
                  <button
                    className="btn btn-light w-100"
                    onClick={() => {
                      setSearch('')
                      setStatusfilter('All Status')
                      customerPagination.setPage(1)
                    }}
                  >
                    <i className="ti ti-filter me-1" />Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredusers.length > 0 ? (
                    customerPagination.pageItems.map((udata, index)=>(
                      <tr key={udata._id} className="customer-table-row" style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar avatar-sm customer-avatar rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center">

                              {udata.profileimage && (
                                <img
                                  src={
                                    udata.profileimage.startsWith('http')
                                      ? udata.profileimage
                                      : `http://localhost:7002/image/${encodeURIComponent(udata.profileimage)}`
                                  }
                                  className="w-100 h-100 rounded-circle"
                                  style={{objectFit:'cover'}}
                                  alt={udata.name || 'Customer'}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.parentElement.querySelector('.customer-initial').style.display = 'block'
                                  }}
                                />
                              )}

                              <span
                                className="customer-initial fw-bold text-secondary"
                                style={{display:udata.profileimage ? 'none' : 'block'}}
                              >
                                {(udata.name || 'C').charAt(0).toUpperCase()}
                              </span>

                            </div>
                            <div>
                              <div className="fw-semibold">{udata.name}</div>
                              <small className="text-secondary">{udata.email}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {udata.totalOrders || 0}
                          </span>
                        </td>

                        <td>
                          <span className="fw-semibold">
                            ₹{Number(udata.totalSpent || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td>
                          <span className={`badge ${
                            (udata.status || 'Active') === 'Active'
                              ? 'bg-success-subtle text-success'
                              : (udata.status || 'Active') === 'Inactive'
                              ? 'bg-secondary-subtle text-secondary'
                              : 'bg-danger-subtle text-danger'
                          }`}>
                            {udata.status || 'Active'}
                          </span>
                        </td>

                        <td className="text-end">
                          <a href={`/updatecustomer/${udata._id}`}>
                            <button className="btn btn-sm btn-light">Edit</button>
                          </a>

                          <button
                            className="btn btn-sm btn-outline-warning"
                            disabled={udata.status === 'Blocked'}
                            onClick={() => handleblock(udata._id)}
                          >
                            {udata.status === 'Blocked' ? 'Blocked' : 'Block'}
                          </button>

                          <button className="btn btn-sm btn-outline-danger">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              totalItems={filteredusers.length}
              page={customerPagination.page}
              pageCount={customerPagination.pageCount}
              pageSize={customerPagination.pageSize}
              onPageChange={customerPagination.setPage}
              onPageSizeChange={customerPagination.setPageSize}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
