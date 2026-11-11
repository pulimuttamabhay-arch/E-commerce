import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'

export default function Inventory() {

    const [statusfilter, setStatusfilter] = useState('All')
    const [selectedcategory,setSelectedcategory] = useState('All')
    const [viewcategory,setViewcategory]=useState([])
    const [product, setProduct] = useState([])

    const getStatus = (stock) => {
        return Number(stock) === 0
            ? 'Out of Stock'
            : Number(stock) <= 5
            ? 'Low Stock'
            : 'In Stock'
    }

    const filterproduct = product.filter((p) => {
      const productcategory = p.category?._id || p.category
        const categorymatch = selectedcategory === 'All' ||
        String(productcategory)===String(selectedcategory)
        const statusmatch = statusfilter === 'All' || 
        getStatus(p.stock) === statusfilter
        return categorymatch && statusmatch
    })
    const productPagination = useTablePagination(filterproduct)

    const fetchproduct = () => {
        axios.get(`${host}/product/viewproduct`)
            .then((res) => {
                console.log(res)
                setProduct(res.data.allproduct || [])
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const fetchedcategory = async (req,res)=>{
        axios.get(`${host}/category/viewcategory`)
        .then((res)=>{
            console.log(res)
            setViewcategory(res.data.allcategory || [])
        })
        .catch((error)=>{
            console.log(error)
        })
    }

    useEffect(() => {
        fetchproduct()
        fetchedcategory()
    }, [])

    const handleDelete = (id) => {
        axios.delete(`${host}/product/deleteproduct/${id}`)
            .then((res) => {
                console.log(res)
                console.log("Product Deleted by id", id)
                fetchproduct()
            })
            .catch((error) => {
                console.log(error)
            })
    }

    

    return (
        <div>
            <main id="content" className="content">
                <div className="container-fluid">

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <span className="page-kicker">PRODUCT MANAGEMENT</span>
                            <h1 className="fs-3 mb-1">Manage Products</h1>
                            <p className="mb-0">
                                Add, update and control product inventory.
                            </p>
                        </div>

                        <a href="/addproduct" className="btn btn-primary">
                            <i className="ti ti-plus me-1" />
                            Add Product
                        </a>
                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-md-3">
                            <div className="card stat-card p-4">
                                <small className="text-secondary">All Products</small>
                                <h3 className="mb-0 mt-1">{product.length}</h3>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card stat-card p-4">
                                <small className="text-secondary">In Stock</small>
                                <h3 className="mb-0 mt-1">
                                    {product.filter((p) => Number(p.stock) > 5).length}
                                </h3>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card stat-card p-4">
                                <small className="text-secondary">Low Stock</small>
                                <h3 className="mb-0 mt-1">
                                    {product.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length}
                                </h3>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card stat-card p-4">
                                <small className="text-secondary">Out of Stock</small>
                                <h3 className="mb-0 mt-1">
                                    {product.filter((p) => Number(p.stock) === 0).length}
                                </h3>
                            </div>
                        </div>

                    </div>

                    <div className="card">

                        <div className="card-body border-bottom">
                            <div className="row g-2">

                                <div className="col-lg-5">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search products..."
                                    />
                                </div>
                            
                                <div className="col-lg-3">
                                    
                                    <select className="form-select" 
                                    value={selectedcategory}
                                    onChange={(e)=>{
                                        setSelectedcategory(e.target.value)
                                        productPagination.setPage(1)
                                    }}>
                                        <option value="All">All Categories</option>
                                       {viewcategory.map((cdata)=>(
                                         <option 
                                         key={cdata._id}
                                         value={cdata._id}
                                         >{cdata.name}</option>
                                          ))}
                                    </select>
                                    
                                </div>
                               

                                <div className="col-lg-2">
                                    <select
                                        className="form-select"
                                        value={statusfilter}
                                        onChange={(e) => {
                                            setStatusfilter(e.target.value)
                                            productPagination.setPage(1)
                                        }}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="In Stock">In Stock</option>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                </div>

                                <div className="col-lg-2">
                                    <button className="btn btn-light w-100">
                                        <i className="ti ti-filter me-1" />
                                        Filter
                                    </button>
                                </div>

                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 admin-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {productPagination.pageItems.map((pdata) => (
                                        <tr key={pdata._id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <img
                                                        src={
                                                            pdata.image
                                                                ? `${host}/image/${pdata.image}`
                                                                : '/assets/img/product-1.png'
                                                        }
                                                        alt={pdata.name}
                                                        className="avatar avatar-md rounded-3 product-thumb"
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null
                                                            e.target.src = '/assets/img/product-1.png'
                                                        }}
                                                    />

                                                    <div>
                                                        <span className="fw-semibold">
                                                            {pdata.name}
                                                        </span>

                                                        <div className="small text-secondary">
                                                            {pdata.brand || 'No Brand'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>₹{pdata.price}</td>
                                            <td>{pdata.stock}</td>

                                            <td>
                                                <span className={
                                                    Number(pdata.stock) === 0
                                                        ? "badge bg-danger"
                                                        : Number(pdata.stock) <= 5
                                                        ? "badge bg-warning text-dark"
                                                        : "badge bg-success"
                                                }>
                                                    {getStatus(pdata.stock)}
                                                </span>
                                            </td>

                                            <td className="text-end">
                                                <a
                                                    href={`/updateproduct/${pdata._id}`}
                                                    className="btn btn-sm btn-light"
                                                >
                                                    Edit
                                                </a>{' '}

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(pdata._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <TablePagination
                            totalItems={filterproduct.length}
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