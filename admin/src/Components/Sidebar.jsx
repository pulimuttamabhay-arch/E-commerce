import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const navigate =useNavigate()
const handlelogout = ()=>{
  const conformsignout = window.confirm("Are You Sure Want To Logout?")
  if(conformsignout){
    localStorage.removeItem("adminstoken")
    alert("Logout Successfully !!")
    navigate('/')
  }
}

  return (
    <div>
       <aside id="sidebar" className="sidebar">
    <div className="logo-area">
      <a href="index.html" className="d-inline-flex align-items-center text-decoration-none">
        <img src="../assets/images/logo-icon.svg" alt="NovaCart" width={26} />
        <span className="logo-text ms-2 fw-bold fs-5">NovaCart <small className="admin-mark">ADMIN</small></span>
      </a>
    </div>
    <ul className="nav flex-column">
      <li className="px-4 py-2"><small className="nav-text text-uppercase fw-semibold">Admin Panel</small></li>
      <li><Link className="nav-link active" data-page="dashboard" to="/Dashboard"><i className="ti ti-home" /><span className="nav-text">Dashboard</span></Link></li>
      <li><Link className="nav-link" data-page="customers" to="/users"><i className="ti ti-users" /><span className="nav-text">Manage Customers</span></Link></li>
      <li><Link className="nav-link" data-page="categories" to="/category"><i className="ti ti-category" /><span className="nav-text">Manage Category</span></Link></li>
      <li><Link className="nav-link" data-page="products" to="/manageproduct"><i className="ti ti-box-seam" /><span className="nav-text">Manage Products</span></Link ></li>
      <li><Link className="nav-link" data-page="orders" to="/order"><i className="ti ti-shopping-cart" /><span className="nav-text">Manage Orders</span></Link></li>
      <li><Link className="nav-link" data-page="payments" to="/payment"><i className="ti ti-credit-card" /><span className="nav-text">Manage Payment</span></Link></li>
      <li><Link className="nav-link" data-page="reviews" to="/review"><i className="ti ti-star" /><span className="nav-text">View Reviews</span></Link></li>
      <li className="px-4 pt-4 pb-2"><small className="nav-text text-uppercase fw-semibold">Account</small></li>
      <li><button className="nav-text ti ti-logout nav-link " onClick={handlelogout}>Logout</button></li>
    </ul>
  </aside>
    </div>
  )
}
