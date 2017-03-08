const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

// some dummy todo objects 
const todos = [{ _id: new ObjectID(), text: "First test todo" }, { _id: new ObjectID(), text: "Second test todo", completed: true, completedAt: 333 }];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

// some dummy user objects
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'user1@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'user2@example.com',
    password: 'userTwoPass'
}];

const populateUsers = (done) => {
    // we can't use insertMany to insert our dummy users because it doesn't call the hashing middleware we implemented previously. remember that we declared the middleware to trigger before saving. insertMany does not trigger the save event. as a workaround, we will save the users one by one. 
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        // now we have 2 promises and we want to wait for both of them to succeed. There's a promise utility method that lets you do that. 
        return Promise.all([userOne, userTwo]);
    }).then(() => {
        // this is the handler for the promise all above. it won't be called until after all promises in the array finishes successfully
        done();
    });
};

module.exports = { todos, populateTodos, users, populateUsers };