import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner'
import { ChatState } from '../../context/ChatProvider';

const Login = () => {
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [loading, setloading] = useState(false);

    const navigate = useNavigate();

    const [showpass, setshowpass] = useState(false)
    const handleshow = () => {
        if(showpass){
            setshowpass(false)
        }else{
            setshowpass(true)
        }
    }

    const {setuser} = ChatState()

    const handleLogin = async() => {
        /* eslint-disable */
        if (!/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)) {
            toast('Enter a valid Email!!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
        setloading(true)
        await axios.post('http://localhost:5000/user/login' , {email , password} , {withCredentials : true}).then(res=>{
            if (res.data.error) {
                toast(res.data.error, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                });
                setloading(false)
                return;
            }
            toast(res.data.msg, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            setloading(false)
            setuser(res.data.user)
            localStorage.setItem('jwt' , (res.data.token))
            localStorage.setItem('user' , JSON.stringify(res.data.user))
            navigate('/chats')
        }).catch(error => {
            toast('Error occured!!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            console.log(error)
        })
    }   

    return (
        <div className='container d-flex justify-content-center mt-1'>

            <div className='mt-5' style={{ minWidth: "40vw" }}>

                <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="form2Example1">Email</label>
                    <input type="email" id="form2Example1" className="form-control" value={email} onChange={(e) => { setemail(e.target.value) }} />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="form2Example2">Password</label>
                    <div className='d-flex'><input type= {showpass ? 'text' : 'password'} id="form2Example2" className="form-control" required value={password} onChange={(e) => { setpassword(e.target.value) }} />
                        <i onClick={handleshow}  className="fa-solid fa-eye d-flex align-items-center ms-1 px-2 " style={{cursor : 'pointer' , backgroundColor : 'black' , color : 'white' , borderRadius : "10px"}}></i></div>
                </div>

                <button type="submit" className="btn btn-primary mb-4" onClick={handleLogin}>{loading ? <TailSpin
                    visible={true}
                    height="23"
                    width="30"
                    color="#FFFFFF"
                    ariaLabel="tail-spin-loading"
                    radius="1"
                /> : "Login"}</button>
            </div>

        </div>
    )
}

export default Login