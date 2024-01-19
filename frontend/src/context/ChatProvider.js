const { createContext, useState, useEffect, useContext } = require("react");
const { useNavigate } = require("react-router-dom");

const ChatContext = createContext();

const ChatProvider = ({children}) => {
    const [user, setuser] = useState()
    const [selectedChat, setselectedChat] = useState('')
    const [chats, setchats] = useState([])
    const [notification, setnotification] = useState([])

    const navigate = useNavigate()
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('user'))
        setuser(userInfo)

        if(!userInfo){
            navigate('/')
        }
    }, [])
    
    return(
        <ChatContext.Provider value={{user , setuser , selectedChat, setselectedChat , chats, setchats , notification, setnotification }}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () =>{
    return useContext(ChatContext)
}

export default ChatProvider