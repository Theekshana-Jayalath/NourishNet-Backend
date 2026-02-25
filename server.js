const express = require("express")
const dotEnv = require("dotenv")
const mogoose = require("mongoose")

const app = express()
dotEnv.config()

console.log("checking",process.env.MONGO_URI)

mogoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database connected successfully")
})
.catch((error)=>{
    console.log(error.message)
})

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});