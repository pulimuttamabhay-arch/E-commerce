
import React from 'react'
import { useState ,useEffect} from 'react'
import axios from 'axios'

export default function Product() {

  const [product,setProduct]=useState({
    pname :'',
    pdesc:'',
    catid:'',
    pprice:'',
    pmrp:'',
    pstock:'',
    pbrand:''
  })

  const [images,setImages]=useState([])
  const [loading,setLoading]=useState(false)
  const [category,setCategory]=useState([])

  const handlechange =(e)=>{
    console.log({...product,[e.target.name]: e.target.value})
    setProduct({...product ,[e.target.name]: e.target.value})
  }

  const handleimages =(e)=>{
    const selectedImages = Array.from(e.target.files || [])

    if(selectedImages.length > 10){
      alert('Please select no more than 10 images')
      e.target.value = ''
      return
    }

    if(selectedImages.some((selectedImage)=>!selectedImage.type.startsWith('image/'))){
      alert('Please select valid image files')
      e.target.value = ''
      return
    }

    setImages(selectedImages.map((file)=>({
      file,
      preview: URL.createObjectURL(file)
    })))
  }

  const resetform =()=>{
    setProduct({
      pname :'',
      pdesc:'',
      catid:'',
      pprice:'',
      pmrp:'',
      pstock:'',
      pbrand:''
    })

    setImages([])

    const fileinput = document.getElementById('productImage')
    if(fileinput){
      fileinput.value = ''
    }
  }

  const handlesubmit =(e)=>{

    e.preventDefault()

    if(loading){
      return
    }

    const sellingPrice = Number(product.pprice)
    const mrp = Number(product.pmrp)

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0 ||
      !Number.isFinite(mrp) || mrp < sellingPrice) {
      alert('MRP must be equal to or greater than the selling price')
      return
    }

    setLoading(true)

    const formdata = new FormData()

    formdata.append('pname',product.pname)
    formdata.append('pdesc',product.pdesc)
    formdata.append('catid',product.catid)
    formdata.append('pprice',product.pprice)
    formdata.append('pmrp',product.pmrp)
    formdata.append('pstock',product.pstock)
    formdata.append('pbrand',product.pbrand)

    images.forEach(({file})=>formdata.append('uimage',file))

    console.log('product details',product)

    axios.post(`${host}/product/addproduct`,formdata)

    .then((res)=>{
      console.log(res)
      alert('product added')

      resetform()
    })

    .catch((error)=>{
      console.log(error)

      if(error.response){
        console.log("Backend response:",error.response.data)
        alert(error.response.data.message || 'Failed to add product')
      }
      else{
        alert('Unable to connect to the server')
      }
    })

    .finally(()=>{
      setLoading(false)
    })
  }

  const fetchcategory=()=>{
    axios.get(`${host}/category/viewcategory`)
    .then((res)=>{
      console.log('fetched response:',res)

      if(Array.isArray(res.data.allcategory)){
        setCategory(res.data.allcategory)
      }
      else{
        setCategory([])
        console.log('Category data not found:',res.data)
      }
    })
    .catch((error)=>{
      console.log('Category fetch error:',error.response?.data || error.message)
      setCategory([])
    })
  }

  useEffect(()=>{
    fetchcategory()
  },[])

  useEffect(()=>{
    return ()=>{
      images.forEach(({preview})=>URL.revokeObjectURL(preview))
    }
  },[images])

  return (
    <div>
      <main id="content" className="content">
        <div className="container-fluid">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="page-kicker">PRODUCT MANAGEMENT</span>
              <h1 className="fs-3 mb-1" >Add Product</h1>
              <p className="mb-0">
                Create a new product for the NovaCart catalog.
              </p>
            </div>

            <a href="/Manageproduct" className="btn btn-light">
              Back to Products
            </a>
          </div>

          <form id="addProductForm" onSubmit={handlesubmit}>
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
                          value={product.pname}
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
                          max={product.pmrp || undefined}
                          step="0.01"
                          name='pprice'
                          value={product.pprice}
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
                          min={product.pprice || 0}
                          step="0.01"
                          name="pmrp"
                          value={product.pmrp}
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
                          value={product.pstock}
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
                          value={product.catid}
                          onChange={handlechange}
                          required
                        >
                          <option value="">
                            {category.length > 0 ? 'Select Category' : 'No categories available'}
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
                          value={product.pbrand}
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
                          value={product.pdesc}
                          onChange={handlechange}
                          required
                        />

                      </div>

                    </div>
                  </div>

                </div>
              </div>

              <div className="col-xl-4">

                <div className="card mb-4">
                  <div className="card-header bg-transparent">
                    <h2 className="fs-5 mb-0">Product Images</h2>
                  </div>

                  <div className="card-body">
                    <input
                      type="file"
                      className="form-control"
                      id="productImage"
                      name="uimage"
                      accept="image/*"
                      multiple
                      onChange={handleimages}
                    />

                    {images.length > 0 && (
                      <div className="row g-2 mt-2">
                        {images.map(({file,preview},index)=>(
                          <div className="col-4" key={`${file.name}-${file.lastModified}`}>
                        <img
                          src={preview}
                          alt={`Product image ${index + 1} preview`}
                          className="img-fluid rounded"
                          style={{
                            width: '100%',
                            height: '90px',
                            objectFit: 'cover'
                          }}
                        />
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="small text-secondary mt-2 mb-0">
                      Choose up to 10 images. The first image is used as the main product photo.
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
                        disabled={loading}
                      >
                        {loading ? 'Adding Product...' : 'Add Product'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={resetform}
                        disabled={loading}
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
