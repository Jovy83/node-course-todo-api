const mongoose = require('mongoose');

// create a model for the Todo collection 
const Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlength: 1, // should have a minimum of 1 char 
        trim: true // will remove any whitespaces before and after your string 
    },
    completed: {
        type: Boolean,
        default: false // default should be false 
    },
    completedAt: {
        type: Number,
        default: null // use null instead of undefined 
    }
    // we don't need a 'createdAt' property since mongo already creates that and encodes it in the objectID. 
});


// export the model 
module.exports = { Todo };


// // we can now instantiate a new Todo object because of the statement above. 
// const newTodo = new Todo({
//     text: 'some Todo'
// })

// // save the data into the db. save() returns a promise so we can call then()
// newTodo.save().then((document) => {
//     console.log('Saved Todo: ', document);
// }, (error) => {
//     console.log('Unable to save Todo: ', error);
// });


// // challenge, create a new object and save to db
// const anotherNewTodo = new Todo({
//     text: 23, // this will still work even if we supplied an integer or bool to a property expecting a string. this is because mongoose will cast it to a string. it will fail if you supply an object though
//     completed: false,
//     completedAt: 123 // - means anytime before 1970, 0 means 1970, + means anything after 1970
//     // 123 is 2 minutes into the year 1970
// });
// anotherNewTodo.save().then((doc) => {
//     console.log('Saved Todo: ', JSON.stringify(doc, undefined, 2));
// }, (e) => {
//     console.log('Unable to save Todo: ', e);
// });