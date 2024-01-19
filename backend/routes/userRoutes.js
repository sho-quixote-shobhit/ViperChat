const express = require('express')
const router = express.Router();
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const requireLogin = require('../middlewares/requireLogin')

router.post('/signup' , asyncHandler(async (req,res)=>{
    const {name , password , email , pic} = req.body;
    if(!name || !password || !email){
        return res.json({error : 'Please enter all fields'})
    }
    try {
        const userExists = await User.findOne({email : email})
        if(userExists){
            return res.json({error : 'User already exists'})
        }
        const newUser = new User({
            name , 
            email ,
            password : await bcrypt.hash(password , 12),
            pic
        })
        await newUser.save().then((user)=>{
            const token = jwt.sign({_id : user._id} , process.env.jwt_secret , {
                expiresIn : '7d'
            })
            user.password = undefined
            res.status(201).json({user , token , msg : 'SignUp successful!!'})
        }).catch(err=>{
            res.json({error : 'Failed to create User'})
        })

    } catch (error) {
        res.json({error : 'Server error'})
        console.log(error)
    }
}))

router.post('/login' , asyncHandler(async (req,res)=>{
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ error: "Please complete the data" })
    }
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.json({ error: "Invalid email or password" })
        }
        await bcrypt.compare(password, user.password).then((match) => {
            if (match) {
                //a token to user
                const { _id } = user;
                const token = jwt.sign({ _id: _id }, process.env.jwt_secret , {
                    expiresIn : '7d'
                })
                user.password = undefined
                res.json({ token, user , msg : 'Login Successful!!'})
            } else {
                return res.json({ error: "Invalid email or password" })
            }
        })

    } catch (error) {
        res.json({ message: "Server error" })
        console.log(error)
    }
}))

router.get('/getusers' , requireLogin , asyncHandler(async(req,res)=>{
    const keyword = req.query.search ? {
        $or : [
            {name : {$regex : req.query.search , $options : "i"}},
            {email : {$regex : req.query.search , $options : "i"}}
        ]
    } : {}

    await User.find(keyword).find({_id : {$ne : req.user._id}}).then((users)=>{
        users.forEach((user)=>{
            user.password = undefined
        })
        res.json({users})
    })
}))


module.exports = router