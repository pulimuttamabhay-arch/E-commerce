
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Cart() {

const [cart,setCart] = useState([])

useEffect(()=>{
const viewcart = async () => {
try {
const token = localStorage.getItem('Usertoken')

const res = await axios.get('http://localhost:7002/cart/viewcart',{
headers:{
Authorization:`Bearer ${token}`
}
})

setCart(res.data.items || [])

} catch(error) {
console.log(error)
}
}

viewcart()
},[])

const updatequantity = async (id,quantity) => {
try {

const token = localStorage.getItem('Usertoken') || localStorage.getItem('usertoken')

const item = cart.find((item)=>item.product?._id === id)

const availableStock = Number(item?.product?.stock || 0)

if(quantity > availableStock){
alert(`Only ${availableStock} products are available in stock`)
return
}

if(quantity <= 0){
removecart(id)
return
}

await axios.put(`http://localhost:7002/cart/updatecart/${id}`,{
quantity: quantity
},{
headers:{
Authorization:`Bearer ${token}`
}
})

const updatedcart = cart.map((item)=>{
if(item.product?._id === id){
return {...item,quantity: quantity}
}
return item
})

const totalQuantity = updatedcart.reduce((total, item) => total + Number(item.quantity || 0), 0)
localStorage.setItem('cartCount', JSON.stringify(totalQuantity))
window.dispatchEvent(new Event('cartUpdated'))
setCart(updatedcart)

} catch(error) {
console.log(error)
alert(error.response?.data?.message || 'Unable to update quantity')
}
}

const removecart = async (id) => {
try {

const token = localStorage.getItem('Usertoken') || localStorage.getItem('usertoken')

await axios.delete(`http://localhost:7002/cart/removecart/${id}`,{
headers:{
Authorization:`Bearer ${token}`
}
})

const updatedcart = cart.filter((item)=>item.product?._id !== id)
const totalQuantity = updatedcart.reduce((total, item) => total + Number(item.quantity || 0), 0)
localStorage.setItem('cartCount', JSON.stringify(totalQuantity))
window.dispatchEvent(new Event('cartUpdated'))
setCart(updatedcart)

} catch(error) {
console.log(error)
}
}

const subtotal = cart.reduce((total,item)=>{
return total + Number(item.product?.price || 0) * Number(item.quantity || 1)
},0)

const deliveryCharge = subtotal >= 599 || subtotal === 0 ? 0 : 50

const totalAmount = subtotal + deliveryCharge

return (
<div>

    <section className="cart-hero">
      <div className="container">
        <span className="cart-hero-eyebrow">
          <i className="bi bi-bag-heart-fill"></i> YOUR SHOPPING BAG
        </span>
        <h1 className="mt-3">
          Shopping <span>Cart.</span>
        </h1>
        <p>Review your selected products and get ready to enjoy your shopping.</p>
        <div className="cart-hero-info">
          <span><i className="bi bi-shield-check"></i> Secure Checkout</span>
          <span><i className="bi bi-truck"></i> Easy Delivery</span>
        </div>
      </div>
      <div className="cart-hero-circle"></div>
      <div className="cart-hero-circle second"></div>
    </section>

    <section className="section cart-section">
      <div className="container">

        <div className="cart-heading">
          <div>
            <span className="eyebrow">YOUR SELECTION</span>
            <h2>My Cart <span>({cart.length} items)</span></h2>
            <p>Manage your products before proceeding to checkout.</p>
          </div>

          <Link className="cart-continue-link" to="/shop">
            <i className="bi bi-arrow-left"></i> Continue Shopping
          </Link>
        </div>

        <div className="row g-4">

          <div className="col-lg-8">

            <div className="cart-items-card">

              <div className="cart-table-heading">
                <div className="row align-items-center">
                  <div className="col-md-5">
                    <b>Product</b>
                  </div>
                  <div className="col-md-2 text-center">
                    <b>Price</b>
                  </div>
                  <div className="col-md-2 text-center">
                    <b>Quantity</b>
                  </div>
                  <div className="col-md-2 text-center">
                    <b>Subtotal</b>
                  </div>
                  <div className="col-md-1"></div>
                </div>
              </div>

              {cart.map((item,index)=>(
                <div key={item.product?._id || index} className="cart-product-row">

                  <div className="row align-items-center g-3">

                    <div className="col-md-5">
                      <div className="cart-product-info">
                        <div className="cart-product-image">
                          <img
                            src={
                              item.product?.image
                                ? (Array.isArray(item.product.image)
                                  ? `http://localhost:7002/image/${item.product.image[0]}`
                                  : item.product.image.startsWith('http')
                                    ? item.product.image
                                    : `http://localhost:7002/image/${item.product.image}`)
                                : '/assets/img/product-1.png'
                            }
                            alt={item.product?.name || 'Product'}
                            onError={(e)=>{
                              e.target.onerror = null
                              e.target.src = '/assets/img/product-1.png'
                            }}
                          />
                        </div>

                        <div className="cart-product-details">
                          <h6>{item.product?.name || 'Product'}</h6>
                          <small>{item.product?.category?.name || item.product?.category?.cname || 'Product'}</small>

                          <div className={Number(item.product?.stock || 0) > 0 ? "cart-stock available" : "cart-stock unavailable"}>
                            <i className={`bi ${Number(item.product?.stock || 0) > 0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                            {Number(item.product?.stock || 0) > 0 ? `Available: ${item.product.stock}` : 'Out of stock'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-2 text-md-center cart-mobile-price" data-label="Price">
                      <span className="cart-mobile-label">Price</span>
                      <b>₹{Number(item.product?.price || 0).toLocaleString('en-IN')}</b>
                    </div>

                    <div className="col-6 col-md-2 text-md-center" data-label="Quantity">
                      <span className="cart-mobile-label">Quantity</span>
                      <div className="cart-quantity">
                        <button
                          type="button"
                          disabled={Number(item.quantity || 1) <= 1}
                          onClick={()=>updatequantity(item.product?._id,Number(item.quantity || 1)-1)}
                        >
                          −
                        </button>

                        <span>{item.quantity || 1}</span>

                        <button
                          type="button"
                          disabled={Number(item.quantity || 1) >= Number(item.product?.stock || 0)}
                          onClick={()=>updatequantity(item.product?._id,Number(item.quantity || 1)+1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-6 col-md-2 text-md-center cart-mobile-subtotal" data-label="Subtotal">
                      <span className="cart-mobile-label">Subtotal</span>
                      <b>₹{(Number(item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}</b>
                    </div>

                    <div className="col-6 col-md-1 text-end text-md-center">
                      <button
                        type="button"
                        className="cart-remove-btn"
                        title="Remove product"
                        onClick={()=>removecart(item.product?._id)}
                      >
                        <i className="bi bi-trash3"></i>
                        <span>Remove</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="cart-empty">
                  <div className="cart-empty-icon">
                    <i className="bi bi-bag-x"></i>
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Looks like you haven't added anything to your cart yet. Explore our collections and find something you love.</p>
                  <Link className="cart-shop-btn" to="/shop">
                    Start Shopping <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              )}

              {cart.length > 0 && (
                <div className="cart-bottom-link">
                  <Link to="/shop">
                    <i className="bi bi-arrow-left"></i> Continue shopping
                  </Link>
                </div>
              )}

            </div>

          </div>

          <div className="col-lg-4">
            <div className="cart-summary-card">

              <div className="cart-summary-heading">
                <div>
                  <span>QUICKSELL</span>
                  <h4>Order Summary</h4>
                </div>
                <div className="cart-summary-icon">
                  <i className="bi bi-receipt"></i>
                </div>
              </div>

              <div className="cart-summary-items">
                <div className="d-flex justify-content-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <b>₹{subtotal.toLocaleString('en-IN')}</b>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <span>Delivery charge</span>
                  <b className={deliveryCharge === 0 ? "text-success" : ""}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </b>
                </div>
              </div>

              {subtotal > 0 && subtotal < 599 && (
                <div className="cart-delivery-progress">
                  <p>
                    Add <b>₹{(599 - subtotal).toLocaleString('en-IN')}</b> more to unlock free delivery!
                  </p>
                  <div className="cart-progress-track">
                    <div
                      className="cart-progress-fill"
                      style={{width: `${Math.min((subtotal / 599) * 100,100)}%`}}
                    ></div>
                  </div>
                  <small>Free delivery on orders above ₹599</small>
                </div>
              )}

              {deliveryCharge === 0 && subtotal > 0 && (
                <div className="cart-free-delivery">
                  <i className="bi bi-check-circle-fill"></i>
                  Congratulations! You get free delivery.
                </div>
              )}

              <div className="cart-summary-total">
                <span>Total Amount</span>
                <h3>₹{totalAmount.toLocaleString('en-IN')}</h3>
              </div>

              <Link
                className={`cart-checkout-btn ${cart.length === 0 ? 'disabled' : ''}`}
                to={cart.length > 0 ? '/checkout' : '/cart'}
                onClick={(e)=>{
                  if(cart.length === 0) e.preventDefault()
                }}
              >
                Proceed to Checkout
                <i className="bi bi-arrow-right"></i>
              </Link>

              <div className="cart-payment-info">
                <i className="bi bi-shield-lock-fill"></i>
                <span>Safe and secure checkout</span>
              </div>

              <div className="cart-summary-footer">
                <i className="bi bi-truck"></i>
                <span>Delivery charge is free on orders above ₹599.</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

</div>
)
}
