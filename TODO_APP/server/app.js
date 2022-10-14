require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
const port = 7000;

// app.use(express.json())
app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGOURL).then((req, res) => {
    console.log("mongoDB Connected 😊")
})

const usersRouter = require('./routes/users')
const todoPickupRouter = require('./routes/todo_pickUp')

const auth = require('./middleware/check_auth')

app.get('/', auth, (req, res) => {
    console.log("Welcome...")
    res.send("Hello Welcome")
})

app.use('/users/', usersRouter)
app.use('/todoPickup', todoPickupRouter)

app.get('*', (req, res) => {
    return res.status(404).send("PAGE NOT FOUND")
})

app.listen(port, () => {
    console.log(`Server Running on Post : - ${port} 😻`)
})