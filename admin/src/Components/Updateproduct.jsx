import { host } from '../../../client/src/Context/Host.jsx'

import React from 'react'
import { useState ,useEffect} from 'react'
import {useParams} from 'react-router-dom'
import axios from 'axios'

export default function Product() {
const [category,setCategory]=useState([])
const [image,setImage]=useState(null)
const [imagePreview,setImagePreview]=useState('')

const [updateproduct ,setUpdateproduct]=useState({
     pname :'',
    pdesc:'',
    catid:'',
    pprice:'',
    pmrp:'',
    pstock:'',
    pbrand:'',
    status:'Active',
    image:''
})

const handlechange=(e)=>{
    console.log({...updateproduct,[e.target.name]:e.target.value})
    setUpdateproduct({...updateproduct,[e.target.name]:e.target.value})
}

const handleimage=(e)=>{
    const file = e.target.files[0]

    if(file){
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
}

const fetchcategory = ()=>{
axios.get(`${host}/category/viewcategory`)
    .then((res)=>{
      console.log('fetched response:',res)
      setCategory(res.data.allcategory)
    })
    .catch((error)=>{
      console.log(error)
    })
}

const {pid} = useParams()
console.log('product id :',pid)

useEffect(()=>{
axios.get(`${host}/product/getproduct/${pid}`)
.then((res)=>{
  console.log(res.data.singleproduct)
  const data = res.data.singleproduct

  setUpdateproduct({
     pname :data.name || '',
    pdesc:data.description || '',
    catid:data.category?._id || data.category || '',
    pprice:data.price ?? '',
    pmrp:Number(data.mrp) > 0 ? data.mrp : data.price ?? '',
    pstock:data.stock ?? '',
    pbrand:data.brand || '',
    status:data.status || 'Active',
    image:data.image || ''
  })
})
.catch((error)=>{
  console.log(error)
})

fetchcategory()
},[pid])

const handleupdate = (e)=>{
  e.preventDefault()

  const formdata = new FormData()

  formdata.append('pname',updateproduct.pname)
  formdata.append('pdesc',updateproduct.pdesc)
  formdata.append('catid',updateproduct.catid?._id || updateproduct.catid)
  formdata.append('pprice',updateproduct.pprice)
  formdata.append('pmrp',updateproduct.pmrp)
  formdata.append('pstock',updateproduct.pstock)
  formdata.append('pbrand',updateproduct.pbrand)
  formdata.append('status',updateproduct.status)

  if(image){
    formdata.append('uimage',image)
  }

  console.log('update details:',updateproduct)

axios.put(`${host}/product/updateproduct/${pid}`,formdata)
.then((res)=>{
  console.log(res)
  alert(res.data.message || 'Product updated successfully')
})
.catch((error)=>{
  console.log(error)
  alert(error.response?.data?.message || 'Product update failed')
})
}

  return (
    <div>
      <main id="content" className="content">
        <div className="container-fluid">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="page-kicker">PRODUCT MANAGEMENT</span>
              <h1 className="fs-3 mb-1" >Update Product</h1>
              <p className="mb-0">
                Update an existing product in the NovaCart catalog.
              </p>
            </div>

            <a href="/Manageproduct" className="btn btn-light">
              Back to Products
            </a>
          </div>

          <form id="addProductForm" onSubmit={handleupdate}>
            <div className="row g-4">

              <div className="col-xl-8">
                <div className="card">

                  <div className="card-header bg-transparent">
                    <h2 className="fs-5 mb-0">Product Information</h2>
                  </div>

                  <div className="card-body">
                    <div className="row g-3">

                      <div className="col-12">
                        <label htmlFor="productName" className="form-label" >
                          Product Name
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          id="productName"
                          placeholder="e.g. Product Name"
                          name='pname'
                          value={updateproduct.pname}
                          onChange={handlechange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="productPrice" className="form-label">
                          Selling Price (₹)
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          id="productPrice"
                          placeholder="Amount"
                          min="0"
                          max={updateproduct.pmrp || undefined}
                          step="0.01"
                          name='pprice'
                          value={updateproduct.pprice}
                          onChange={handlechange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="productMrp" className="form-label">
                          MRP (₹)
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          id="productMrp"
                          placeholder="Original price"
                          min={updateproduct.pprice || 0}
                          step="0.01"
                          name="pmrp"
                          value={updateproduct.pmrp}
                          onChange={handlechange}
                          required
                        />

                        <small className="text-secondary">
                          The selling price must not exceed the MRP.
                        </small>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="productStock" className="form-label">
                          Stock Quantity
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          id="productStock"
                          placeholder="100"
                          name='pstock'
                          min="0"
                          value={updateproduct.pstock}
                          onChange={handlechange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="productCategory" className="form-label">
                          Category
                        </label>

                        <select
                          className="form-select"
                          id="productCategory"
                          name='catid'
                          value={updateproduct.catid?._id || updateproduct.catid || ''}
                          onChange={handlechange}
                          required
                        >
                          <option value="">
                            Select Category
                          </option>

                          {category.map((cat)=>(
                            <option
                              key={cat._id}
                              value={cat._id}
                            >
                              {cat.name}
                            </option>
                          ))}

                        </select>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="productBrand" className="form-label">
                          Brand
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          id="productBrand"
                          name='pbrand'
                          value={updateproduct.pbrand}
                          onChange={handlechange}
                          placeholder="NovaCart Brand"
                        />
                      </div>

                      <div className="col-12">
                        <label
                          htmlFor="productDescription"
                          className="form-label"
                        >
                          Description
                        </label>

                        <textarea
                          className="form-control"
                          id="productDescription"
                          rows={6}
                          placeholder="Describe product features, specifications and warranty."
                          name='pdesc'
                          value={updateproduct.pdesc}
                          onChange={handlechange}
                        />

                      </div>

                    </div>
                  </div>

                </div>
              </div>

              <div className="col-xl-4">

                <div className="card mb-4">
                  <div className="card-header bg-transparent">
                    <h2 className="fs-5 mb-0">Product Image</h2>
                  </div>

                  <div className="card-body">

                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="New Product Preview"
                        style={{
                          width:'120px',
                          height:'120px',
                          objectFit:'cover'
                        }}
                      />
                    ) : updateproduct.image ? (
                      <img
                        src={`${host}/image/${updateproduct.image}`}
                        alt="Current Product"
                        style={{
                          width:'120px',
                          height:'120px',
                          objectFit:'cover'
                        }}
                        onError={(e)=>{
                          e.target.onerror = null
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : null}

                    <input
                      type="file"
                      className="form-control mt-3"
                      id="productImage"
                      name="uimage"
                      accept="image/*"
                      onChange={handleimage}
                    />

                    <p className="small text-secondary mt-2 mb-0">
                      Use a clear JPG or PNG product image.
                    </p>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header bg-transparent">
                    <h2 className="fs-5 mb-0">Publishing</h2>
                  </div>

                  <div className="card-body">

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="featured"
                      />

                      <label
                        className="form-check-label"
                        htmlFor="featured"
                      >
                        Mark as featured product
                      </label>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Update Product
                      </button>

                      <button
                        type="reset"
                        className="btn btn-light"
                        onClick={()=>{
                          setImage(null)
                          setImagePreview('')
                        }}
                      >
                        Reset
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </form>

        </div>
      </main>
    </div>
  )
}
