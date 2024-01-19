const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
    },
    pic : {
        type : String,
        default : "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
    }
} , {timestamps : true})

module.exports = mongoose.model('User' , userSchema)