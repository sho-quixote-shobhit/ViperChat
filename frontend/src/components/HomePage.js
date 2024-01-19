import React, { useEffect, useState } from 'react'
import SignUp from './authentication/SignUp'
import Login from './authentication/Login'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
    const [showLogin, setshowLogin] = useState(true)
    const [showSignup, setshowSignup] = useState(false)

    const handleShowLogin = () => {
        setshowLogin(true)
        setshowSignup(false)
    }

    const handleShowSignUp = () => {
        setshowLogin(false)
        setshowSignup(true)
    }
    

    return (
        <div className='container d-flex flex-column justify-content-center mt-5' style={{}}>
            <div className='p-3 mb-2'>
                <h4 className='m-0 p-0 text-center'>ChatApp</h4>
            </div>
            <div className='d-flex justify-content-center'>
                <button className='btn btn-dark mx-5 m-2 p-1 px-3' onClick={handleShowLogin}>Login</button>
                <button className='btn btn-dark mx-5 m-2 p-1 px-3' onClick={handleShowSignUp}>SignUp</button>
            </div>

            {showLogin && <div><Login /></div>}
            {showSignup && <div><SignUp /></div>}

        </div>
    )
}

export default HomePage