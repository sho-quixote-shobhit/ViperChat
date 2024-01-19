import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner'
import { ChatState } from '../../context/ChatProvider';

const SignUp = () => {
    const [name, setname] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [confirmpass, setconfirmpass] = useState('')
    const [image, setimage] = useState(null)
    const [pic, setpic] = useState('')


    const [loading, setloading] = useState(false)
    const [showimgloading, setshowimgloading] = useState(false)
    const [showpass, setshowpass] = useState(false)
    const [showpassconfirm, setshowpassconfirm] = useState(false)

    const {setuser} = ChatState()

    const handleshow = () => {
        if (showpass) {
            setshowpass(false)
        } else {
            setshowpass(true)
        }
    }
    const handleshowconfirm = () => {
        if (showpassconfirm) {
            setshowpassconfirm(false)
        } else {
            setshowpassconfirm(true)
        }
    }
    const postDetails = async (photo) => {
        setshowimgloading(true)
        if (photo === undefined) {
            toast('Photo Undefined!!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            setshowimgloading(false)
            return;
        }
        const formData = new FormData();
        formData.append('key', 'c060d25b69b68bc751a850dde2affec8')
        formData.append('image', image)
        await axios.post('https://api.imgbb.com/1/upload', formData, { timeout: 60000 }).then(res => {
            setpic(res.data.data.url)
        }).catch(err => {
            toast(`Error while uploading ${err}`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            setshowimgloading(false)
            return;
        })
        setshowimgloading(false)
    }

    const navigate = useNavigate();

    const handleSignUp = async () => {
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
        if (password.length < 8) {
            toast('Password must be 8 characters', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
        if (password !== confirmpass) {
            toast('Password do not matched!!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }

        if (!password || !name || !email || !confirmpass) {
            toast('Add all the fields', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });   
            return;
        }
        setloading(true)
        await axios.post('http://localhost:5000/user/signup', { name, email, password , pic }, { withCredentials: true }).then(res => {
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
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div className='container d-flex justify-content-center mt-1'>

            <div className='mt-5' style={{ minWidth: "40vw" }}>
                <div className="form-outline mb-4">
                    <label className="form-label">UserName</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => { setname(e.target.value) }} />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => { setemail(e.target.value) }} />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label" >Password</label>
                    <div className='d-flex'><input type={showpass ? 'text' : 'password'} className="form-control" required value={password} onChange={(e) => { setpassword(e.target.value) }} />
                        <i onClick={handleshow} className="fa-solid fa-eye d-flex align-items-center ms-1 px-2 " style={{ cursor: 'pointer', backgroundColor: 'black', color: 'white', borderRadius: "10px" }}></i></div>
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label" >Confirm Password</label>
                    <div className='d-flex'><input type={showpassconfirm ? 'text' : 'password'} className="form-control" required value={confirmpass} onChange={(e) => { setconfirmpass(e.target.value) }} />
                        <i onClick={handleshowconfirm} className="fa-solid fa-eye d-flex align-items-center ms-1 px-2 " style={{ cursor: 'pointer', backgroundColor: 'black', color: 'white', borderRadius: "10px" }}></i></div>
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label" >Upload profile Picture</label>
                    <div className='d-flex'>
                        <input type='file' className="form-control" accept='.jpg , .jpeg , .png' required onChange={(e) => { setimage(e.target.files[0]) }} />
                        {showimgloading ? <TailSpin
                            visible={true}
                            height="23"
                            width="30"
                            color="#000000"
                            ariaLabel="tail-spin-loading"
                            radius="1"
                        /> : <button disabled = {pic.length > 0 || !image ? true : false} className='btn btn-success ms-1' onClick={postDetails}>Add</button>}
                    </div>
                </div>


                <button type="submit" className="btn btn-primary mb-4" onClick={handleSignUp}>{loading ? <TailSpin
                    visible={true}
                    height="23"
                    width="30"
                    color="#FFFFFF"
                    ariaLabel="tail-spin-loading"
                    radius="1"
                /> : "SignUp"}</button>
            </div>

        </div>
    )
}

export default SignUp