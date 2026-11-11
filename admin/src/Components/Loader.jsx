import React from 'react'

export default function Loader() {
    return (
        <div
            className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 vh-100 bg-white"
            style={{ zIndex: 9999 }}
        >
            <div className="text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                    style={{
                        width: '3.5rem',
                        height: '3.5rem'
                    }}
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <h5 className="mt-3 mb-1">Loading...</h5>

                <p className="text-secondary mb-0">
                    Please wait while we prepare your page.
                </p>

            </div>
        </div>
    )
}