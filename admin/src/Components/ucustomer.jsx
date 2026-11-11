
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

export default function Updatecustomer() {

  const { uid } = useParams()
  const navigate = useNavigate()

  const [updateuser, setUpdateuser] = useState({
    uname: '',
    uemail: '',
    status: 'Active'
  })

  const handlechange = (e) => {
    console.log({...updateuser , [e.target.name]:e.target.value})
    setUpdateuser({
      ...updateuser,
      [e.target.name]: e.target.value
    })
  }

  const fetchuser = () => {
    axios.get(`http://localhost:7002/User/getuser/${uid}`)
      .then((res) => {
        console.log('fetched users',res)

        const data = res.data.single_user

        setUpdateuser({
          uname: data.name || '',
          uemail: data.email || '',
          status: data.status || 'Active'
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    fetchuser()
  }, [uid])

  const handlesubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.put(
        `http://localhost:7002/User/updateprofile/${uid}`,
        {
          uname: updateuser.uname,
          uemail: updateuser.uemail
        }
      )

      console.log('Customer details updated:', res.data)

      const statusres = await axios.put(
        `http://localhost:7002/User/updatestatus/${uid}`,
        {
          status: updateuser.status
        }
      )

      console.log('Customer status updated:', statusres.data)

      alert('Customer updated successfully')
      navigate('/users')

    } catch (error) {
      console.log(error.response?.data || error.message)
      alert('Failed to update customer')
    }
  }

  return (
    <div>
      <main id="content" className="content">
        <div className="container-fluid">

          <div className="mb-4">
            <span className="page-kicker">CUSTOMER MANAGEMENT</span>
            <h1 className="fs-3 mb-1">Update Customer</h1>
            <p className="mb-0">Edit customer account details.</p>
          </div>

          <div className="card">
            <div className="card-body">

              <form onSubmit={handlesubmit}>

                <div className="mb-3">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="uname"
                    value={updateuser.uname}
                    onChange={handlechange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="uemail"
                    value={updateuser.uemail}
                    onChange={handlechange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Customer Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={updateuser.status}
                    onChange={handlechange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="uphone"
                    value={updateuser.uphone}
                    onChange={handlechange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    name="uaddress"
                    value={updateuser.uaddress}
                    onChange={handlechange}
                    rows="3"
                  />
                </div> */}

                <button type="submit" className="btn btn-primary">
                  Update Customer
                </button>

                <button
                  type="button"
                  className="btn btn-light ms-2"
                  onClick={() => navigate('/users')}
                >
                  Cancel
                </button>

              </form>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
