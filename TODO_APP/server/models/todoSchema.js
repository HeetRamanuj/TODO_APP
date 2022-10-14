const mongoose = require('mongoose')
mongoose.pluralize(null)

const toDoListSchema = mongoose.Schema({
    email: String,
    title: String,
    description: String,
    creation_todo_date: String,
})

const toDoListModel = mongoose.model('todo_list_master', toDoListSchema);
module.exports = toDoListModel