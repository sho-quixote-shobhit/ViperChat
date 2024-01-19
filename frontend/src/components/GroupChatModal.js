import React, { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    Input,
    Spinner,
    Box
} from '@chakra-ui/react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChatState } from '../context/ChatProvider';
import axios from 'axios';
import UserListItem from './UserListItem';
import { CloseIcon } from '@chakra-ui/icons';

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatname] = useState();
    const [search, setsearch] = useState('');
    const [searchResults, setsearchResults] = useState([]);
    const [loading, setloading] = useState(false);
    const [selectedUsers, setselectedUsers] = useState([]);

    const { user, chats, setchats } = ChatState();

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

    const handleGroup = async (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast('user already added!!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
        setselectedUsers([...selectedUsers, userToAdd])
    }

    const handleDelete = (user) => {
        setselectedUsers(selectedUsers.filter((c) => c._id !== user._id))
    }

    const handleSubmit = async () => {
        if (!groupChatName || selectedUsers.length < 2) {
            toast('Please fill all the fields!!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
        try {
            await axios.post('http://localhost:5000/chat/creategroup', { name: groupChatName, users: JSON.stringify(selectedUsers.map((u) => u._id)) }, {
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                }
            }).then((res) => {
                setchats([res.data , ...chats])
                onClose();
                toast('New Group chat created!!', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "light",
                });
                return;
            })
        } catch (error) {
            toast('Error occured while creating group', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "light",
            });
            return;
        }
    }

    return (
        <>
            <span onClick={onOpen}>{children}</span>
            <Modal isCentered isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize='35px'
                        display='flex'
                        justifyContent='center'
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' flexDir='column' alignItems='center'>
                        <FormControl>
                            <Input
                                placeholder='Chat Name'
                                mb={3}
                                onChange={(e) => { setGroupChatname(e.target.value) }}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder='search users'
                                mb={3}
                                onChange={(e) => { handlesearch(e.target.value) }}
                            />
                        </FormControl>
                        <Box w="100%" display='flex' flexWrap='wrap'>
                            {selectedUsers.map((user) => {
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
                                        onClick={() => { handleDelete(user) }}
                                    >
                                        {user.name}
                                        <CloseIcon pl={1} />
                                    </Box>
                                )
                            })}
                        </Box>
                        {loading ? (<Spinner />) : (
                            searchResults?.slice(0, 4).map((user) => {
                                return (
                                    <UserListItem user={user} key={user._id} handleFunction={() => handleGroup(user)} />
                                )
                            })
                        )}

                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal