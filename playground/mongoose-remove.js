
const {ObjectID} = require('mongodb'); // provides a function to verify if an id's format is valid 

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

// 3 ways of deleting data from DB

// Todo.remove() = this works like Todo.find() 
/// but you can't pass in an empty arg and expect all docs to be removed. You will need to pass an empty object 
Todo.remove({}).then((res) => {
    console.log(res);
});

// this will also return to you the deleted doc 
Todo.findOneAndRemove({ _id: '123' }).then((todo) => {
    console.log(todo);
});

// self explanatory. will also return to you the deleted doc 
Todo.findByIdAndRemove('123').then((todo) => {
    console.log(todo);
});