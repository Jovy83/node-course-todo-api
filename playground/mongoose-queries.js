const {ObjectID} = require('mongodb'); // provides a function to verify if an id's format is valid 

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

const id = '58b4c67a576c672b64267891';

if (!ObjectID.isValid(id)) {
    console.log('ID not valid');
}

// find() is what we've covered already. find lets you query as many Todos as you like. Pass no args to retrieve all OR pass a filter.
Todo.find({
    _id: id // no need to convert the string to objectID ourselves. mongoose takes care of that 
}).then((todos) => {
    console.log('Todos: ', todos); // todos here = array of docs
}, (err) => {

})

// this will only return 1 document
Todo.findOne({
    _id: id
}).then((todo) => {
    console.log('Todo: ', todo); // todo here = single document
}, (err) => {

})

// this will specifically do filters by id 
Todo.findById(id).then((todo) => {
    if (!todo) {
        return console.log('ID not found');
    }
    console.log('Todo by ID: ', todo); // todo here = single document
}).catch((e) => console.log(e)); // this will trigger if the client passes in an invalid objectID format but the preferred way is to validate the id first before making any find queries. 

// if you know you're just trying to fetch one individual document, use findOne().

// if you want to find one document by something other than id, use findOne()
// ALL of these functions return null or an empty array if it doesn't find anything 

// ASK IF FINDBYID IS FASTER THAN FINDONE -- no need, i think it's obvious already 