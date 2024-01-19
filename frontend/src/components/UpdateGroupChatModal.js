import { Box, Button, FormControl, IconButton, Input, Spinner, useDisclosure } from '@chakra-ui/react'
import React, { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import { CloseIcon, ViewIcon } from '@chakra-ui/icons'
import { ChatState } from '../context/ChatProvider'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import UserListItem from './UserListItem'

const UpdateGroupChatModal = ({ fetchAgain, setfetchAgain , fetchMessages}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {user , selectedChat , setselectedChat} = ChatState();

    const [groupChatName, setGroupChatName] = useState('');
    const [search, setsearch] = useState('');
    const [searchResults, setsearchResults] = useState([]);
    const [loading, setloading] = useState(false);

    const [renameloading, setrenameloading] = useState(false)

    const handleRemoveUser = async(usertoremove) => {
        if(selectedChat.groupAdmin._id !== user._id && usertoremove._id !== user._id){
            toast('Only Admin can remove someone!!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
        try {
            setloading(true);
            await axios.put('http://localhost:5000/chat/groupremoveuser' , {chatId : selectedChat._id , userId : usertoremove._id}, {headers : {
                'Content-Type' : 'application/json',
                'Authorization' : 'Bearer ' + localStorage.getItem('jwt')
            }}).then((res) => {
                usertoremove._id === user._id ? setselectedChat('') : setselectedChat(res.data)
                setfetchAgain(!fetchAgain)
                fetchMessages();
                setGroupChatName('')
                setloading(false)
            })
        } catch (error) {
            toast('Error occured', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
    }

    const handleRename = async() => {
        if(!groupChatName) return;

        try {
            setrenameloading(true)
            await axios.put('http://localhost:5000/chat/renamegroup' , {chatName : groupChatName , chatId : selectedChat._id} , {headers : {
                'Content-Type' : 'application/json',
                'Authorization' : 'Bearer ' + localStorage.getItem('jwt')
            }}).then((res)=>{
                setselectedChat(res.data)
                setfetchAgain(!fetchAgain)
                onClose()
                setGroupChatName('')
                setrenameloading(false)
            })
        } catch (error) {
            
        }
    }

    const handleAdduser = async (newuser) => {
        if(selectedChat.users.find((u) => u._id === newuser._id)){
            toast('User already in group!!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
        if(selectedChat.groupAdmin._id !== user._id){
            toast('Only admins can add users!!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }

        try {
            setloading(true);
            await axios.put('http://localhost:5000/chat/groupadduser' , {chatId : selectedChat._id , userId : newuser._id}, {headers : {
                'Content-Type' : 'application/json',
                'Authorization' : 'Bearer ' + localStorage.getItem('jwt')
            }}).then((res) => {
                setselectedChat(res.data)
                setfetchAgain(!fetchAgain)
                setGroupChatName('')
                setloading(false)
            })
        } catch (error) {
            toast('Error occured', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
    }

    const handlesearch = async (query) => {
        setsearch(query);
        if (!query) {
            toast('Search cant be empty', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
        try {
            setloading(true);
            await axios.get(`http://localhost:5000/user/getusers?search=${search}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                }
            }).then(res => {
                setsearchResults(res.data.users)
                setloading(false)
            })
        } catch (error) {
            toast('Failed to load!!', {
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

    return (
        <>
            <IconButton display={{base : 'flex'}} icon={<ViewIcon />} onClick={onOpen} />
            <Modal isCentered isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" display="flex" justifyContent='center'>{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w="100%" display='flex' flexWrap='wrap' pb={3}>
                        {selectedChat.users.map((user) => {
                                return (
                                    <Box
                                        key={user._id}
                                        px={2}
                                        py={1}
                                        borderRadius='lg'
                                        m={1}
                                        mb={2}
                                        fontSize={12}
                                        backgroundColor='purple'
                                        color='white'
                                        cursor='pointer'
                                        onClick={() => { handleRemoveUser(user) }}
                                    >
                                        {user.name}
                                        <CloseIcon pl={1} />
                                    </Box>
                                )
                            })}
                        </Box>

                        <FormControl display='flex'>
                            <Input 
                                placeholder='chat Name'
                                mb={3}
                                value={groupChatName}
                                onChange={(e)=>setGroupChatName(e.target.value)}
                            />
                            <Button
                                colorScheme='teal'
                                ml={1}
                                isLoading={renameloading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>

                        <FormControl>
                            <Input 
                                placeholder='Add user to group'
                                mb={1}
                                onChange={(e)=>{handlesearch(e.target.value)}}
                            />
                            
                        </FormControl>

                        {loading ? (<Spinner />) : (
                            searchResults?.slice(0, 4).map((user) => {
                                return (
                                    <UserListItem user={user} key={user._id} handleFunction={() => {handleAdduser(user)}} />
                                )
                            })
                        )}
                    </ModalBody>

                    <ModalFooter>
                            <Button onClick={()=> handleRemoveUser(user)} colorScheme='red'>
                                Leave Group
                            </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal