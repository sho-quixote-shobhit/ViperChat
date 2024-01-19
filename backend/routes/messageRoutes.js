const express = require('express');
const requireLogin = require('../middlewares/requireLogin');
const expressAsyncHandler = require('express-async-handler');
const router = express.Router();
const Message = require('../models/Message')
const Chat = require('../models/Chat')


//send message
router.post('/', requireLogin, expressAsyncHandler(async (req, res) => {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
        res.json({ error: 'Invalid data parsed!!' })
        return;
    }

    const message = new Message({
        sender: req.user._id,
        content,
        chat: chatId
    })

    await message.save();
    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message
    })
    await Message.findById(message._id).populate('sender', '-password').populate({ path: 'chat', populate: { path: 'users', select: '-password' } }).populate({
        path: 'chat',
        populate: {
            path: 'latestMessage',
            populate: {
                path: 'sender',
                select: '-password'
            }
        }
    }).then((newMessage) => {
        res.json(newMessage)
    })


}))

//fetch messages of a particular chat
router.get('/:chatId', requireLogin, expressAsyncHandler(async (req, res) => {
 try {
    const messages = await Message.find({chat : req.params.chatId}).populate('sender' , '-password').populate('chat')
    res.json(messages)
 } catch (error) {
    res.json({error : 'Error occured while fetching!!'})
    console.log(error)
 } 
}))


module.exports = router