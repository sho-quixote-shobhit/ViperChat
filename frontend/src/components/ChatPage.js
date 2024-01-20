import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box } from '@chakra-ui/react'
import SideDrawer from './SideDrawer'
import MyChats from './MyChats'
import ChatBox from './ChatBox'


const ChatPage = () => {
    const { user } = ChatState()
    const [fetchAgain, setfetchAgain] = useState(false)

    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                w={'100%'}
                h={'91.5vh'}
                p={'10px'}
            >
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && <ChatBox fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />}
            </Box>

        </div>
    )
}

export default ChatPage