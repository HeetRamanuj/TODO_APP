const mongoose = require('mongoose')
mongoose.pluralize(null)


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
    }
})




const userSchemaModel = mongoose.model('todo_users', userSchema)
module.exports = userSchemaModel