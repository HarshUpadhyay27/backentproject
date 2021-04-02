const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({path:"./config.env"})

mongoose.connect(process.env.DATABASE,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log('connection succefull')
}).catch(()=>{
    console.log('no connection');
})
