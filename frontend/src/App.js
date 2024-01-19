import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom'
import ChatPage from './components/ChatPage';
import HomePage from './components/HomePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

function App() {

    const navigate = useNavigate()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        if(user){
            navigate('/chats')
        }
    }, [navigate])
    

    return (
        <>
                <Routes>
                    <Route exact path="/" element={<HomePage />} />
                    <Route exact path="/chats" element={<ChatPage />} />
                </Routes>
                <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    closeOnClick
                    rtl={false}
                    theme="light"
                />
        </>
    );
}

export default App;
