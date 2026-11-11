import { host } from '../../../client/src/Context/Host.jsx'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Avatar from '@mui/material/Avatar'
import { deepOrange } from '@mui/material/colors'
import socket from '../socket'

export default function Topbar() {

  const [notifications, setNotifications] = useState([])
  const [connected, setConnected] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState(
    () => localStorage.getItem('admin-sidebar-hidden') === 'true'
  )
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('admin-theme') || 'light'
  )

  

  const token = localStorage.getItem('adminstoken')

  // Unread notification count
  const notificationcount = notifications.filter(
    (item) => !item.isRead
  ).length

  useEffect(() => {
    document.body.classList.toggle('sidebar-hidden', sidebarHidden)
    localStorage.setItem('admin-sidebar-hidden', String(sidebarHidden))

    const sidebar = document.getElementById('sidebar')
    sidebar?.classList.toggle('mobile-show', mobileSidebarOpen)

    const overlays = document.querySelectorAll('.overlay')
    const closeMobileSidebar = () => setMobileSidebarOpen(false)
    overlays.forEach((overlay) => {
      overlay.classList.toggle('show', mobileSidebarOpen)
      overlay.addEventListener('click', closeMobileSidebar)
    })

    document.documentElement.dataset.theme = theme
    document.documentElement.setAttribute('data-bs-theme', theme)
    localStorage.setItem('admin-theme', theme)

    return () => {
      overlays.forEach((overlay) => {
        overlay.removeEventListener('click', closeMobileSidebar)
      })
    }
  }, [sidebarHidden, mobileSidebarOpen, theme])


  // Play notification sound
  const playSound = () => {

    const audio = new Audio('/notification.mp3')

    audio.play().catch((error) => {
      console.log('Notification sound blocked:', error.message)
    })

  }


  // Fetch notifications from MongoDB
const fetchNotifications = async () => {

    try {

        const response = await axios.get(
            `${host}/notification/viewnotifications`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        console.log('MongoDB Notifications:', response.data.notifications)

        if (response.data.success) {
            setNotifications(response.data.notifications)
        }

    } catch (error) {

        console.log(
            'Notification fetching error:',
            error.response?.data || error.message
        )

    }

}


  useEffect(() => {

    // Load previous notifications
    fetchNotifications()


    // Socket connection
    const handleConnect = () => {

      console.log('Connected to notification server:', socket.id)

      setConnected(true)

    }


    const handleDisconnect = (reason) => {

      console.log('Disconnected:', reason)

      setConnected(false)

    }


    const handleConnectError = (error) => {

      console.log('Socket error:', error.message)

      setConnected(false)

    }


    // Receive new order notification
 const handleNewOrder = (data) => {

    console.log('New order received:', data)

    playSound()

    fetchNotifications()

}


    socket.on('connect', handleConnect)

    socket.on('disconnect', handleDisconnect)

    socket.on('connect_error', handleConnectError)

    socket.on('new-order', handleNewOrder)

    setConnected(socket.connected)


    return () => {

      socket.off('connect', handleConnect)

      socket.off('disconnect', handleDisconnect)

      socket.off('connect_error', handleConnectError)

      socket.off('new-order', handleNewOrder)

    }

  }, [])



  // Mark individual notification as read
  const markAsRead = async (id) => {

    try {

      const response = await axios.put(
        `${host}/notification/markread/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...item, isRead: true }
              : item
          )
        )

      }

    } catch (error) {

      console.log('Mark read error:', error.message)

    }

  }



  // Mark all notifications as read
  const markAllAsRead = async () => {

    try {

      const response = await axios.put(
        `${host}/notification/markallread`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {

        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            isRead: true
          }))
        )

      }

    } catch (error) {

      console.log('Mark all read error:', error.message)

    }

  }



  return (

    <div>

      <nav
        id="topbar"
        className="navbar bg-white border-bottom fixed-top topbar px-3"
      >

        <button
          type="button"
          id="toggleBtn"
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
          onClick={() => setSidebarHidden((hidden) => !hidden)}
          aria-label={sidebarHidden ? 'Show sidebar' : 'Hide sidebar'}
          aria-expanded={!sidebarHidden}
        >
          <i className={`ti ${sidebarHidden ? 'ti-layout-sidebar-left-expand' : 'ti-layout-sidebar-left-collapse'}`} />
        </button>


        {/* MOBILE */}

        <button
          type="button"
          id="mobileBtn"
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          onClick={() => setMobileSidebarOpen((open) => !open)}
          aria-label={mobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileSidebarOpen}
        >
          <i className={`ti ${mobileSidebarOpen ? 'ti-x' : 'ti-layout-sidebar-left-expand'}`} />
        </button>


        <div className="ms-auto">

          <ul className="list-unstyled d-flex align-items-center mb-0 gap-1">

            <li>
              <button
                type="button"
                className="btn btn-light btn-icon btn-sm theme-toggle"
                onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
              </button>
            </li>

            {/* NOTIFICATION DROPDOWN */}

            <li className="dropdown">

              <button
                type="button"
                className="position-relative btn-icon btn-sm btn-light btn rounded-circle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Notifications"
              >

                <i className="ti ti-bell fs-5" />


                {notificationcount > 0 && (

                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">

                    {notificationcount > 99 ? '99+' : notificationcount}

                  </span>

                )}

              </button>



              {/* NOTIFICATION MENU */}

              <div
                className="dropdown-menu dropdown-menu-end dropdown-menu-md p-0 shadow"
                style={{
                  width: 380,
                  maxWidth: '90vw',
                  maxHeight: 500,
                  overflowY: 'auto'
                }}
              >


                {/* HEADER */}

                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">

                  <div>

                    <h6 className="mb-0">
                      Notifications
                    </h6>

                    <small className="text-secondary">
                      {notifications.length} total notifications
                    </small>

                  </div>


                  <span className={`badge ${connected ? 'bg-success' : 'bg-danger'}`}>

                    {connected ? 'Online' : 'Offline'}

                  </span>

                </div>



                {/* CONNECTION STATUS */}

                {!connected && (

                  <div className="px-3 py-2 small text-danger border-bottom">

                    Connecting to notification server...

                  </div>

                )}



                {/* MARK ALL AS READ */}

                {notificationcount > 0 && (

                  <div className="px-3 py-2 border-bottom text-end">

                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={markAllAsRead}
                    >

                      <i className="ti ti-checks me-1" />

                      Mark all as read

                    </button>

                  </div>

                )}



                {/* NOTIFICATION LIST */}

                {notifications.length > 0 ? (

                  <ul className="list-unstyled p-0 m-0">

                    {notifications.map((notification) => (

                      <li
                        key={notification._id}
                        className={`p-3 border-bottom ${
                          notification.isRead
                            ? 'bg-white'
                            : 'bg-light'
                        }`}
                      >

                        <div className="d-flex gap-3">

                          <div>

                            <div className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center"
                              style={{
                                width: 40,
                                height: 40
                              }}
                            >

                              <i className="ti ti-shopping-cart fs-4" />

                            </div>

                          </div>



                          <div className="flex-grow-1 small">

                            <div className="d-flex justify-content-between align-items-start">

                              <p className="mb-1 fw-semibold">

                                {notification.message || 'New order received!'}

                              </p>


                              {!notification.isRead && (

                                <span
                                  className="rounded-circle bg-primary"
                                  style={{
                                    width: 8,
                                    height: 8
                                  }}
                                />

                              )}

                            </div>



                            <p className="mb-1">

                              <strong>Customer:</strong>{' '}

                              {notification.customerName || 'Customer'}

                            </p>



                            <p className="mb-1">

                              <strong>Order ID:</strong>{' '}

                              {notification.orderId?._id || notification.orderId || 'N/A'}

                            </p>



                            <p className="mb-1">

                              <strong>Amount:</strong>{' '}

                              ₹{Number(notification.amount || 0).toLocaleString('en-IN')}

                            </p>



                            <div className="text-secondary mb-2">

                              {notification.createdAt
                                ? new Date(notification.createdAt).toLocaleString()
                                : ''}

                            </div>



                            {!notification.isRead && (

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => markAsRead(notification._id)}
                              >

                                <i className="ti ti-check me-1" />

                                Mark as read

                              </button>

                            )}

                          </div>

                        </div>

                      </li>

                    ))}

                  </ul>

                ) : (

                  <div className="p-4 text-center text-secondary">

                    <i className="ti ti-bell-off fs-2" />

                    <p className="mb-0">
                      No notifications
                    </p>

                    <small>
                      New orders will appear here.
                    </small>

                  </div>

                )}



                {/* FOOTER */}

                <div className="px-3 py-3 text-center border-top">

                  <small className="text-secondary">

                    You are viewing your order notification history.

                  </small>

                </div>


              </div>

            </li>



            {/* ADMIN PROFILE DROPDOWN */}

            <li className="ms-3 dropdown">

              <a
                href="#!"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >

                <Avatar sx={{ bgcolor: deepOrange[500] }}>
                  A
                </Avatar>

              </a>



              <div
                className="dropdown-menu dropdown-menu-end p-0"
                style={{ minWidth: 200 }}
              >

                <div>

                  <div className="d-flex gap-3 align-items-center border-dashed border-bottom px-3 py-3">

                    <Avatar sx={{ bgcolor: deepOrange[500] }}>
                      A
                    </Avatar>


                    <div>

                      <h4 className="mb-0 small">
                        NovaCart Administrator
                      </h4>

                      <p className="mb-0 small">
                        Administrator
                      </p>

                    </div>

                  </div>



                  <div className="p-3 d-flex flex-column gap-1 small lh-lg">

                    <a href="/Dashboard">
                      <span>Home</span>
                    </a>

                    <a href="#!">
                      <span>Inbox</span>
                    </a>

                    <a href="#!">
                      <span>Chat</span>
                    </a>

                    <a href="#!">
                      <span>Activity</span>
                    </a>

                    <a href="#!">
                      <span>Account Settings</span>
                    </a>

                  </div>

                </div>

              </div>

            </li>


          </ul>

        </div>

      </nav>

    </div>

  )

}