import { host } from '../../../client/src/Context/Host.jsx'

import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function Updatecat() {

  const [updatecategory, setUpdatecategory] = useState({
    cname: '',
    cdesc: ''
  })

  const Handlechange = (e) => {
    console.log({
      ...updatecategory,
      [e.target.name]: e.target.value
    })

    setUpdatecategory({
      ...updatecategory,
      [e.target.name]: e.target.value
    })
  }

  const { cid } = useParams()

  console.log('category id :', cid)

  useEffect(() => {

    axios.get(`${host}/category/getcategory/${cid}`)
      .then((res) => {

        console.log(res.data.singleCategory)

        const data = res.data.singleCategory

        setUpdatecategory({
          cname: data.name,
          cdesc: data.description
        })

      })
      .catch((error) => {
        console.log(error)
      })

  }, [cid])


  const handleupdate = () => {

    console.log('updated details:', updatecategory)

    axios.put(
      `${host}/category/updatecategory/${cid}`,
      updatecategory
    )
      .then((res) => {

        console.log(res)

        alert(res.data.message)

      })
      .catch((error) => {
        console.log(error)
      })
  }


  return (
    <div>

      <div
        className="modal-dialog modal-dialog-centered"
        id="categoryModal"
        tabIndex={-1}
        aria-hidden="true"
      >

        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content">

            <div className="modal-header">

              <h5 className="modal-title">
                Add / Edit Category
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />

            </div>


            <div className="modal-body">

              <div className="mb-3">

                <label className="form-label">
                  Category Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Gaming"
                  onChange={Handlechange}
                  name="cname"
                  value={updatecategory.cname}
                />

              </div>


              <div className="mb-3">

                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Category description"
                  onChange={Handlechange}
                  name="cdesc"
                  value={updatecategory.cdesc}
                />

              </div>


              <div className="form-check">

                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultChecked
                  id="categoryActive"
                />

                <label
                  className="form-check-label"
                  htmlFor="categoryActive"
                >
                  Active category
                </label>

              </div>

            </div>


            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleupdate}
              >
                Update Category
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

