const express = require('express')
const router = express.Router();
const asyncHandler = require('express-async-handler');
const requireLogin = require('../middlewares/requireLogin');
const Chat = require('../models/Chat')

//fetchchats of logged in user
router.get('/', requireLogin, asyncHandler(async (req, res) => {
    try {
        //matching all the chats where current logged in user is present
        await Chat.find({users : {$elemMatch : {$eq : req.user._id}}})
        .populate('users' , '-password')
        .populate('groupAdmin' , '-password')
        .populate({ path: 'latestMessage', populate: { path: 'sender', select: '-password' } })
        .sort({updatedAt : -1})
        .then((chats)=>{
            res.json({chats})
        })
    } catch (error) {
        res.json({error : 'server error!!'})
        console.log(error)
    }
}))

//create chat or access existing chat
router.post('/', requireLogin, asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.json({ error: "No userId" })
    }

    try {
        const isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        }).populate('users', '-password').populate({ path: 'latestMessage', populate: { path: 'sender', select: '-password' } });

        if (isChat.length > 0) {
            res.json( isChat[0] )
        } else {
            try {
                const createChat = new Chat({
                    chatName: 'sender',
                    isGroupChat: false,
                    users: [req.user._id, userId]
                })
                await createChat.save().then((newChat) => {
                    newChat.populate('users' , '-password').then(()=>{
                        res.json(newChat)
                    })
                    
                })
            } catch (error) {
                res.json({ error: 'Server error!' })
                console.log(error)
            }
        }
    } catch (error) {
        res.json({ error: 'Server error!' })
        console.log(error)
    }
}))


router.post('/creategroup', requireLogin, asyncHandler(async (req, res) => {
    if(!req.body.users || !req.body.name){
        return res.json({error : 'Please fill all the fields!!'})
    }
    try {
        console.log(req.body.users)
        const usersInGroup = JSON.parse(req.body.users)
        console.log(usersInGroup)
        if(usersInGroup.length < 2){
            return res.json({error : 'Group must have more than 2 members!!'})
        }
        usersInGroup.push(req.user)

        const groupChat = new Chat({
            chatName : req.body.name,
            users : usersInGroup,
            isGroupChat : true,
            groupAdmin : req.user
        })
        await groupChat.save().then((newGroupChat)=>{
            newGroupChat.populate('users' , '-password').then(()=>{
                res.json(newGroupChat)
            })
        })

    } catch (error) {
        console.log(error)
    }
}))

router.put('/groupadduser', requireLogin, asyncHandler(async (req, res) => {
    const {chatId , userId} = req.body;

    try {
        await Chat.findByIdAndUpdate(chatId , {
            $push : {users : userId}
        } , {new : true}).populate('users' , '-password').populate('groupAdmin' , '-password').then((addedUserChat)=>{
            res.json(addedUserChat)
        })
    } catch (error) {
        res.json({erro : 'Server error'})
        console.log(error)
    }
}))

router.put('/groupremoveuser', requireLogin, asyncHandler(async (req, res) => {
    const {chatId , userId} = req.body;

    try {
        await Chat.findByIdAndUpdate(chatId , {
            $pull : {users : userId}
        } , {new : true}).populate('users' , '-password').populate('groupAdmin' , '-password').then((addedUser)=>{
            res.json(addedUser)
        })
    } catch (error) {
        res.json({erro : 'Server error'})
        console.log(error)
    }
}))


router.put('/renamegroup', requireLogin, asyncHandler(async (req, res) => {
    const {chatId , chatName} = req.body;

    try {
        await Chat.findByIdAndUpdate(chatId , {
            chatName
        } , {new : true}).populate('users' , '-password').populate('groupAdmin' , '-password').then((groupChat)=>{
            res.json(groupChat)
        }).catch(err => {
            console.log(err)
        })
    } catch (error) {
        console.log(error)
    }
}))


module.exports = router