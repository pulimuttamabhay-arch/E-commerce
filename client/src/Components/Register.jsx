
import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
   const navigate = useNavigate()
    const [register,setRegister]= useState({
      uname:'',
      uemail:'',
      upassword:''
  })
  const [profileimage, setProfileimage] = useState(null)
  const [imagepreview, setImagepreview] = useState('')

  const handelchange =(e)=>{
    console.log({...register,[e.target.name]:e.target.value})
  setRegister({...register,[e.target.name]:e.target.value})
}

const handleimagechange = (e) => {
  const file = e.target.files[0]

  if (file) {
    setProfileimage(file)
    setImagepreview(URL.createObjectURL(file))
  }
}

const handelsubmit = async (e)=>{
  e.preventDefault()

  try {
    console.log('register user',register)

    const res = await axios.post('http://localhost:7002/User/adduser',register)

    console.log("response",res.data)

    if (!res.data.success || !res.data.newuser?._id) {
      alert(res.data.message || 'User registration failed')
      return
    }

    if (profileimage) {
      const formData = new FormData()
      formData.append('profileimage', profileimage)

      try {
        const imageRes = await axios.put(
          `http://localhost:7002/User/uploadprofileimage/${res.data.newuser._id}`,
          formData
        )

        console.log('Image upload response:', imageRes.data)
        console.log('Saved filename:', imageRes.data.updateprofile?.profileimage)
        alert(res.data.message)
        navigate('/login')
      } catch (error) {
        console.log('Image upload error:', error.response?.data || error.message)
        alert('Account created, but profile image upload failed. Please try uploading it later.')
      }
    } else {
      alert(res.data.message || 'Registration successful')
      navigate('/login')
    }
  } catch (error) {
    console.log(error)
    alert(error.response?.data?.message || 'Registration failed')
  }
}

  return (
    <div>
      <section className="register-section">
        <div className="register-decoration register-decoration-one"></div>
        <div className="register-decoration register-decoration-two"></div>

        <div className="container">
          <div className="register-layout">

            <div className="register-content">
              <span className="register-eyebrow">
                <i className="bi bi-stars"></i> JOIN QUICKSELL
              </span>

              <h1>
                Your shopping
                <span> journey starts here.</span>
              </h1>

              <p>
                Create your QuickSell account and discover a better
                way to shop. Save your favourite products, manage
                your orders and enjoy a seamless experience.
              </p>

              <div className="register-benefits">
                <div>
                  <i className="bi bi-person-check"></i>
                  <span>Personalised Shopping</span>
                </div>
                <div>
                  <i className="bi bi-heart"></i>
                  <span>Save Your Favourite Products</span>
                </div>
                <div>
                  <i className="bi bi-box-seam"></i>
                  <span>Track Your Orders Easily</span>
                </div>
              </div>
            </div>

            <div className="register-card">
              <div className="register-card-icon">
                <i className="bi bi-person-plus-fill"></i>
              </div>

              <span className="eyebrow">
                GET STARTED
              </span>

              <h2 className="mt-2">
                Create your account
              </h2>

              <p className="small-muted">
                Join QuickSell and start shopping today.
              </p>

              <form onSubmit={handelsubmit}>

                <div className="register-profile">
                  <label htmlFor="profileimage" className="register-profile-label">
                    <img
                      src={imagepreview || '/assets/img/profile.png'}
                      alt="Profile"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://placehold.co/100x100?text=User'
                      }}
                    />
                    <span className="register-camera">
                      <i className="bi bi-camera-fill"></i>
                    </span>
                  </label>

                  <input
                    type="file"
                    id="profileimage"
                    accept="image/*"
                    className="d-none"
                    onChange={handleimagechange}
                  />

                  <p>Upload your profile picture</p>
                </div>

                <label className="form-label">
                  Full Name
                </label>

                <div className="register-input-group">
                  <i className="bi bi-person"></i>
                  <input
                    className="form-control"
                    placeholder="Enter your full name"
                    type="text"
                    name='uname'
                    value={register.uname}
                    onChange={handelchange}
                    required
                  />
                </div>

                <label className="form-label mt-3">
                  Email Address
                </label>

                <div className="register-input-group">
                  <i className="bi bi-envelope"></i>
                  <input
                    className="form-control"
                    placeholder="you@example.com"
                    type="email"
                    name='uemail'
                    value={register.uemail}
                    onChange={handelchange}
                    required
                  />
                </div>

                <label className="form-label mt-3">
                  Password
                </label>

                <div className="register-input-group">
                  <i className="bi bi-lock"></i>
                  <input
                    className="form-control"
                    placeholder="Create a password"
                    type="password"
                    name='upassword'
                    value={register.upassword}
                    onChange={handelchange}
                    required
                  />
                </div>

                <button type="submit" className="register-submit-btn mt-4">
                  Create Account
                  <i className="bi bi-arrow-right"></i>
                </button>

              </form>

              <div className="register-divider">
                <span>ALREADY A MEMBER?</span>
              </div>

              <p className="text-center small-muted mb-0">
                Already registered?
                <Link to="/login" className="register-login-link">
                  Sign in
                </Link>
              </p>

              <div className="register-security">
                <i className="bi bi-shield-lock-fill"></i>
                Your information is safe and secure.
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
