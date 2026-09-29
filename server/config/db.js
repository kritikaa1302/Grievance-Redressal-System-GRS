const mongoose=require('mongoose')
const dotenv=require('dotenv')
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB
