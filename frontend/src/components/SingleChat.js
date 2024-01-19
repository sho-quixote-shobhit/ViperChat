import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import ProfileModal from './ProfileModal';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import  '../styles/messageStyles.css'
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationdata from './animations/typing.json'

const ENDPOINT = "http://localhost:5000"
var socket , selectedChatCompare , roomId;

const SingleChat = ({ fetchAgain, setfetchAgain }) => {
    const { user, selectedChat, setselectedChat , notification, setnotification } = ChatState();

    const getsender = (loggeduser, users) => {
        return users[0]._id === loggeduser._id ? users[1].name : users[0].name
    }

    const getsenderFull = (loggeduser, users) => {
        return users[0]._id === loggeduser._id ? users[1] : users[0]
    }

    const [messages, setmessages] = useState([])
    const [loading, setloading] = useState(false)
    const [newMessage, setnewMessage] = useState('')
    const [socketConnected, setsocketConnected] = useState(false)
    const [istyping, setistyping] = useState(false)
    const [typing, settyping] = useState(false)

    const fetchMessages = async () => {
        if(!selectedChat) return;
        try {
            setloading(true)

            await axios.get(`http://localhost:5000/message/${selectedChat._id}` , {headers : {
                'Authorization' : 'Bearer ' + localStorage.getItem('jwt')
            }}).then(res => {
                setmessages(res.data);
                setloading(false)
                socket.emit('join chat' , selectedChat._id)
            })
        } catch (error) {
            toast('Error while loading messages!!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            console.log(error)
            return;
        }
    }

    const sendMessage = async(e) => {
        if(e.key === 'Enter' && newMessage){
            socket.emit('stop typing' , selectedChat._id)
            try {
                setnewMessage('')
                await axios.post('http://localhost:5000/message/' , {content : newMessage , chatId : selectedChat._id} , {headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : 'Bearer ' + localStorage.getItem('jwt')
                }}).then((res)=>{
                    socket.emit('new message' , res.data)
                    setmessages([...messages , res.data])
                })
            } catch (error) {
                toast('Error while sending message!!', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                });
                console.log(error)
                return;
            }
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit('setup' , user);
        socket.on('connected' , () => {
            setsocketConnected(true)
        })
        socket.on('typing' , (room)=>{
            if(roomId === room){
                setistyping(true)
            }
        })
        socket.on('stop typing' , (room)=>{
            if(roomId === room){
                setistyping(false)
            }
        })
    }, [])

    useEffect(() => {
        fetchMessages()
        selectedChatCompare = selectedChat
        roomId = selectedChat._id
    }, [selectedChat])
    

    
    useEffect(() => {
        socket.on('message received' , (newmessageReceived) => {
            if(!selectedChatCompare || selectedChatCompare._id !== newmessageReceived.chat._id){
                if(!notification.includes(newmessageReceived)){
                    setnotification([newmessageReceived , ...notification])
                    setfetchAgain(!fetchAgain)
                }
            }else{
                setmessages([...messages , newmessageReceived])
            }   
        })
    })

    const typingHandler = (e) => {
        setnewMessage(e.target.value)
        if(!socketConnected) return;
        if(!typing){
            settyping(true)
            socket.emit('typing' , selectedChat._id)
        }

        let lastTypingTime = new Date().getTime()
        var timerlength = 1000;

        setTimeout(() => {
            var timenow = new Date().getTime();
            var timeDiff = timenow - lastTypingTime
            if(timeDiff >= timerlength && typing){
                socket.emit('stop typing' , selectedChat._id)
                settyping(false)
            }
        }, timerlength);
    }
    
    const defaultOptions = {
        loop : true,
        autoplay : true,
        animationData : animationdata,
        rendererSettings : {
            preserveAspectRatio : "xMidYMid slice"
        }
    }

    return (
        <>
            {
                selectedChat ? (<>
                    <Text
                        fontSize={{ base: '28px', md: '30px' }}
                        pb={3}
                        px={2}
                        w="100%"
                        display='flex'
                        justifyContent={{ base: 'space-between' }}
                        alignItems='center'
                    >
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            icon={<ArrowBackIcon />}
                            onClick={(() => { setselectedChat('') })}
                        />
                        {!selectedChat.isGroupChat ? (<>
                            {getsender(user, selectedChat.users)}
                            <ProfileModal user={getsenderFull(user, selectedChat.users)} />
                        </>) : (<>
                            {selectedChat.chatName.toUpperCase()}
                            <UpdateGroupChatModal fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} fetchMessages = {fetchMessages} />
                        </>)}
                    </Text>

                    <Box
                        display='flex'
                        flexDir='column'
                        justifyContent='flex-end'
                        p={3}
                        bg="E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY='hidden'
                    >
                        {loading ? (<Spinner size='xl' w={20} h={20} alignSelf='center' margin='auto' />) :

                            (<div className = "messages">
                                <ScrollableChat messages = {messages} />
                            </div>)}

                        <FormControl onKeyDown={(e)=>sendMessage(e)} isRequired mt={3}>
                            {istyping ? (<div>
                                <Lottie options={defaultOptions} width={70} style={{marginLeft : '0' , marginBottom : '15'}} />
                            </div>) : (<></>)}
                            <Input variant='filled' bg='E0E0E0' placeholder='Enter a message..' onChange={(e)=>typingHandler(e)} value={newMessage}/>
                        </FormControl>

                    </Box>

                </>) : (
                    <Box display='flex' alignItems='center' justifyContent='center' h="100%">
                        <Text fontSize='3xl' pb={3}>
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )
            }
        </>
    )
}

export default SingleChat