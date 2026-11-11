import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import TablePagination from './TablePagination'
import useTablePagination from './useTablePagination'
import { host } from '../../../client/src/Context/Host'

export default function Acategory() {
  const [viewcategory,setViewcategory] = useState([])
  const [viewproduct,setViewproduct] = useState([])
  const [editid ,setEditid]=useState(null)
  const [statusfilter,setStatusfilter]=useState('All')
  const [search,setSearch]=useState('')
  const [categoryImage,setCategoryImage] = useState(null)
  const [imagePreview,setImagePreview] = useState('')
  const [updatecategory,setUpdatecategory]=useState({
     cname: '',
    cdesc: '',
    status:'Active'
  })

  const handleimage = (e)=>{
    const file = e.target.files[0]

    if(file){
      setCategoryImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleedit =(id)=>{
    console.log('edit category id :',id)
    setEditid(id)
    axios.get(`${host}/category/getcategory/${id}`)
    .then((res)=>{
      console.log('category Data :',res.data.singleCategory)
      const data = res.data.singleCategory
      setUpdatecategory({
        cname:data.name,
        cdesc:data.description,
        status:data.status
      })
      setCategoryImage(null)
      setImagePreview(data.image ? `${host}/image/${data.image}` : '')
    })
    .catch((error)=>{
      console.log(error)
    })
  }

const handlechange =(e)=>{
  console.log({...updatecategory,[e.target.name]: e.target.value})
  setUpdatecategory({
    ...updatecategory, [e.target.name]:e.target.value
  })
}

const handlesubmit =()=>{
  const formdata = new FormData()

  formdata.append('cname',updatecategory.cname)
  formdata.append('cdesc',updatecategory.cdesc)
  formdata.append('status',updatecategory.status)

  if(categoryImage){
    formdata.append('uimage',categoryImage)
  }

  if (editid){
    //update category
    console.log("updating category",editid)
    console.log('updated data',updatecategory)

       axios.put(
      `${host}/category/updatecategory/${editid}`,
      formdata
    )
    .then((res)=>{
      console.log(res)
      alert(res.data.message)
      fetchcategory()
      setEditid(null)
      setUpdatecategory({
        cname:'',
        cdesc:'',
        status:'Active'
      })
      setCategoryImage(null)
      setImagePreview('')
    })
    .catch((error)=>{
      console.log(error.response?.data || error)
    })
  }else{
    console.log("Adding category:",updatecategory)

    axios.post(
      `${host}/category/addcategory`,
      formdata
    )
    .then((res)=>{
      console.log(res)
      alert("Category added successfully !!!")
      fetchcategory()
      setUpdatecategory({
        cname:'',
        cdesc:'',
        status:'Active'
      })
      setCategoryImage(null)
      setImagePreview('')
    })
    .catch((error)=>{
      console.log(error.response?.data || error)
    })
  }

}

const fetchcategory = ()=>{
  axios.get(`${host}/category/viewcategory`)
  .then((res)=>{
    console.log('fetched response:',res)
    setViewcategory(res.data.allcategory)

  })
  .catch((error)=>{
    console.log(error)
  })
}

const fetchproduct = ()=>{
  axios.get(`${host}/product/viewproduct`)
  .then((res)=>{
    console.log('fetched products:',res.data.allproduct)
    setViewproduct(res.data.allproduct)
  })
  .catch((error)=>{
    console.log(error)
  })
}

useEffect(()=>{
 fetchcategory()
 fetchproduct()
},[])

const filteredcategories = viewcategory.filter((vdata)=>{
  const matchesStatus = statusfilter === 'All' || vdata.status === statusfilter
  const matchesSearch = vdata.name?.toLowerCase().includes(search.toLowerCase().trim())
  return matchesStatus && matchesSearch
})
const categoryPagination = useTablePagination(filteredcategories)

const handeldelete = (id)=>{
  console.log(id)
  axios.delete(`${host}/category/deletecategory/${id}`)
  .then((res)=>{
    console.log(res)
    console.log("category deleted by id",id)
    fetchcategory()
  })
  .catch((error)=>{
    console.log(error)
  })
}

  return (
    <div>
      <div>
        <div id="overlay" className="overlay" />

        {/* MAIN CONTENT */}
        <main id="content" className="content">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="page-kicker">CATEGORY MANAGEMENT</span>
                <h1 className="fs-3 mb-1">Manage Category</h1>
                <p className="mb-0">Create, edit and remove product categories.</p>
              </div>
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#categoryModal" onClick={()=>{
                setEditid(null) 
                setUpdatecategory({cname:'',
                  cdesc:'',
                  status:'Active'
                })
                setCategoryImage(null)
                setImagePreview('')
              }}>
                <i className="ti ti-plus me-1"  />Add Category</button>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="card stat-card p-4">
                  <small className="text-secondary">Total Categories</small>
                  <h3 className="mb-0 mt-1">{viewcategory.length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card stat-card p-4">
                  <small className="text-secondary">Active Categories</small>
                  <h3 className="mb-0 mt-1">{viewcategory.filter((vdata)=>vdata.status === 'Active').length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card stat-card p-4">
                  <small className="text-secondary">Products Assigned</small>
                  <h3 className="mb-0 mt-1">{viewproduct.length}</h3>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body border-bottom">
                <div className="row g-2">
                  <div className="col-lg-6">
                    <input
                      className="form-control"
                      placeholder="Search category..."
                      value={search}
                      onChange={(e)=>{
                        setSearch(e.target.value)
                        categoryPagination.setPage(1)
                      }}
                    />
                  </div>
                  <div className="col-lg-3">
                    <select className="form-select"
                    value={statusfilter}
                    onChange={(e)=>{
                      setStatusfilter(e.target.value)
                      categoryPagination.setPage(1)
                    }}>
                      <option value='All'>All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 admin-table">
                  <thead className="table-light">
                    <tr>
                      <th>Category</th>
                      <th>Image</th>
                      <th>Products</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryPagination.pageItems.map((vdata)=>(
                      <tr key={vdata._id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="icon-shape icon-sm bg-primary-subtle text-primary rounded-3">
                              <i className="ti ti-headphones" />
                            </div>
                            <div className="fw-semibold">{vdata.name}</div>
                          </div>
                        </td>
                        <td>
                          {vdata.image ? (
                            <img
                              src={`${host}/image/${vdata.image}`}
                              alt={vdata.name}
                              style={{
                                width:'55px',
                                height:'55px',
                                objectFit:'cover',
                                borderRadius:'8px'
                              }}
                              onError={(e)=>{
                                e.target.onerror = null
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span className="text-secondary">No image</span>
                          )}
                        </td>
                        <td>
                          {viewproduct.filter((pdata)=>
                            String(pdata.category?._id || pdata.category) === String(vdata._id)
                          ).length}
                        </td>
                        <td>{vdata.createdAt}</td>
                        <td>
                          {vdata.status === 'Active' ? (
                            <span className="badge bg-success-subtle text-success">Active</span>
                          ):(
                            <span className="badge bg-danger-subtle text-danger">Inactive</span>
                          )}
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#categoryModal" onClick={()=>handleedit(vdata._id)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={()=> handeldelete(vdata._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                totalItems={filteredcategories.length}
                page={categoryPagination.page}
                pageCount={categoryPagination.pageCount}
                pageSize={categoryPagination.pageSize}
                onPageChange={categoryPagination.setPage}
                onPageSizeChange={categoryPagination.setPageSize}
              />
            </div>
          </div>
          <div className="modal fade" id="categoryModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add / Edit Category</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Category Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleimage}
                    />

                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Category Preview"
                          style={{
                            width:'120px',
                            height:'120px',
                            objectFit:'cover',
                            borderRadius:'10px'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category Status</label>
                    <select className="form-select" name="status" value={updatecategory.status} onChange={handlechange}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <label className="form-label">Category Name</label>
                    <input type="text" className="form-control" placeholder="e.g. Gaming" onChange={handlechange} name='cname' value={updatecategory.cname}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={3} placeholder="Category description" onChange={handlechange} name='cdesc' value={updatecategory.cdesc}/>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" defaultChecked id="categoryActive" />
                    <label className="form-check-label" htmlFor="categoryActive">Active category</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal" onClick={()=>{
                    setEditid(null) 
                    setUpdatecategory({
                      cname:'',
                      cdesc:'',
                      status:'Active'
                    })
                    setCategoryImage(null)
                    setImagePreview('')
                  }}>Cancel</button>
                  <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handlesubmit}>Save Category</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}