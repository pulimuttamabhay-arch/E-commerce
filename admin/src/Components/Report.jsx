import React from 'react'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'

export default function Report() {
  const topSellingProducts = [
    { name: 'Nova X Pro Headphones', image: './assets/images/product-1.png', category: 'Audio', unitsSold: 128, revenue: '₹3,83,872' },
    { name: 'Pulse Smart Watch', image: './assets/images/product-2.png', category: 'Wearables', unitsSold: 96, revenue: '₹4,31,904' },
    { name: 'AirBeat Wireless Buds', image: './assets/images/product-3.png', category: 'Audio', unitsSold: 84, revenue: '₹1,67,916' }
  ]
  const productPagination = useTablePagination(topSellingProducts)

  return (
    <div>
      <main id="content" className="content">
        <div className="container-fluid">
          <div className="mb-4">
            <h1 className="fs-3 mb-1">Reports &amp; Analytics</h1>
            <p className="mb-0">Track sales, orders and customer performance.</p>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body p-4">
                    <h6 className="mb-3">Gross Sales</h6>
                    <h3 className="fw-bold mb-1">₹4,52,380</h3>
                    <p className="mb-0 text-success small">+12.8% vs last month</p>
                    </div>
                    </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card h-100">
                        <div className="card-body p-4">
                          <h6 className="mb-3">Orders</h6>
                          <h3 className="fw-bold mb-1">1,284</h3>
                          <p className="mb-0 text-success small">+8.4% vs last month</p>
                          </div>
                          </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card h-100">
                              <div className="card-body p-4">
                                <h6 className="mb-3">Average Order</h6>
                                <h3 className="fw-bold mb-1">₹3,524</h3>
                                <p className="mb-0 text-success small">+4.1% vs last month</p>
                                </div></div></div><div className="col-md-3">
                                  <div className="card h-100">
                                    <div className="card-body p-4">
                                      <h6 className="mb-3">Refunds</h6>
                                      <h3 className="fw-bold mb-1">₹18,420</h3>
                                      <p className="mb-0 text-danger small">3.2% of sales</p>
                                      </div></div></div></div><div className="card mb-4">
                                        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                                          <div><h2 className="fs-5 mb-1">Sales Overview</h2>
                                          <p className="mb-0 small text-secondary">Current year compared with last year</p>
                                          </div><button id="btn-random" className="btn btn-light btn-sm">Refresh Demo Data</button></div>
                                          <div className="card-body"><div id="salesChart" /></div></div>
                                          <div className="card">
                                            <div className="card-header bg-transparent">
                                              <h2 className="fs-5 mb-0">Top Selling Products</h2>
                                            </div>
                                            <div className="table-responsive">
                                              <table className="table align-middle mb-0">
                                                <thead className="table-light">
                                                  <tr>
                                                    <th>Product</th>
                                                    <th>Category</th>
                                                    <th>Units Sold</th>
                                                    <th>Revenue</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {productPagination.pageItems.map((product) => (
                                                    <tr key={product.name}>
                                                      <td>
                                                        <img src={product.image} width={42} height={42} className="rounded me-2" alt={product.name} />
                                                        {product.name}
                                                      </td>
                                                      <td>{product.category}</td>
                                                      <td>{product.unitsSold}</td>
                                                      <td>{product.revenue}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                            <TablePagination
                                              totalItems={topSellingProducts.length}
                                              page={productPagination.page}
                                              pageCount={productPagination.pageCount}
                                              pageSize={productPagination.pageSize}
                                              onPageChange={productPagination.setPage}
                                              onPageSizeChange={productPagination.setPageSize}
                                            />
                                          </div>
                                        </div>
                                      </main>

    </div>
  )
}
