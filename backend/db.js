const mongoose = require('mongoose')


const ConnectToMongo = () => {
    mongoose.connect(process.env.mongoUrl)
    mongoose.connection.on('connected', ()=>{
        console.log('connected to database')
    })
    mongoose.connection.on('error' , ()=>{
        console.log('connection failed')
    })
}

module.exports = ConnectToMongo