import { Box, Button, Tooltip, Text, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, Stack, Skeleton, Spinner } from '@chakra-ui/react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import ProfileModal from './ProfileModal'
import { useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';
import UserListItem from './UserListItem';
import { BadgedButton } from "@react-md/badge";

const SideDrawer = () => {

    const [search, setsearch] = useState('')
    const [searchResults, setsearchResults] = useState([])
    const [loading, setloading] = useState(false)
    const [loadingChat, setloadingChat] = useState(false)

    const { user, setselectedChat, chats, setchats, notification, setnotification } = ChatState();
    const navigate = useNavigate();

    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleLogout = () => {
        confirmAlert({
            title: 'Logout!!',
            message: 'Are you sure you want to logout?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => confirmlogout()
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    }
    const confirmlogout = () => {
        localStorage.clear();
        toast('Logged Out Successfully!!', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            theme: "light",
        });
        navigate('/')
    }

    const handleSearch = async () => {
        if (!search) {
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
            })
            setloading(false)
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

    const accessChat = async (userId) => {
        try {
            setloadingChat(true)
            await axios.post('http://localhost:5000/chat/', { userId }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                }
            }).then((res => {
                if (!chats.find((c) => c._id === res._id)) setchats([res.data, ...chats])
                setselectedChat(res.data)
                setloadingChat(false)
                onClose()
            }))

        } catch (error) {
            toast('Error while accessing chat!!', {
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
    const getsender = (loggeduser, users) => {
        return users[0]._id === loggeduser._id ? users[1].name : users[0].name
    }


    return (
        <>
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                bg="white"
                w='100%'
                p='5px 10px 5px 10px'
                borderWidth='5px'
            >
                <Tooltip
                    label="Search for users"
                    hasArrow
                    placement='bottom-end'
                >
                    <Button variant='ghost' display='flex' alignItems='center' onClick={onOpen}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <Text display={{ base: 'none', md: 'flex' }} px={4} m='auto auto'>Search User</Text>
                    </Button>
                </Tooltip>

                <Text fontSize='2xl' m='auto auto'>
                    ViperChat
                </Text>
                <Menu>
                    <MenuButton p={1}>
                        <BadgedButton id="notifications" buttonChildren={< BellIcon fontSize="2xl" />}>{notification.length}</BadgedButton>
                    </MenuButton>
                    <MenuList pl={2}>
                        {!notification.length && 'No new Messages'}
                        {notification.map((noti) => {
                            return (
                                <MenuItem key={noti._id} onClick={() => {
                                    setselectedChat(noti.chat);
                                    setnotification(notification.filter((n) => n !== noti))
                                }}>
                                    {noti.chat.isGroupchat ? `New Message in ${noti.chat.chatname}` : `new Message from ${getsender(user, noti.chat.users)}`}
                                </MenuItem>
                            )
                        })}
                    </MenuList>
                </Menu>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic} />
                    </MenuButton>
                    <MenuList>
                        <ProfileModal user={user}>
                            <MenuItem>My Profile</MenuItem>
                        </ProfileModal>
                        <MenuDivider />
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </Box>

            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader>Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display='flex' pb={2}>
                            <Input
                                placeholder='search by name or email'
                                mr={2}
                                value={search}
                                onChange={(e) => { setsearch(e.target.value) }}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <>
                                <Stack>
                                    <Skeleton height='30px' />
                                    <Skeleton height='30px' />
                                    <Skeleton height='30px' />
                                    <Skeleton height='30px' />
                                    <Skeleton height='30px' />
                                    <Skeleton height='30px' />
                                </Stack>
                            </>
                        ) : (
                            <>
                                {searchResults?.map((user) => {
                                    return (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => accessChat(user._id)}
                                        />
                                    )
                                })}
                            </>
                        )}
                        {loadingChat && <Spinner ml='auto' display='flex' />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer