// mocha and nodemon are not required to import. that's now how they are use if you can recall
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// some dummy todo objects 
const todos = [{ _id: new ObjectID(), text: "First test todo" }, { _id: new ObjectID(), text: "Second test todo" }];

// this runs BEFORE EVERY TEST CASE. So basically we delete eveyrthing in the collection to get a clean slate then we insert our dummy todo objects for testing 
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new Todo', (done) => {
        // specify done because this is an async task
        var text = 'Test todo text';

        // make the test request
        request(app)
            .post('/todos')
            .send({ text }) // this object will be converted from object to JSON by supertest automatically
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(text);
            })
            .end((err, response) => { // end the post request here but we're not passing done like we did in the previous lectures since we're not yet finished. we will pass in a func because we need to verify what got stored in our mongodb collection
                if (err) {
                    return done(err);
                }
                // verify the data in the db is correct
                // update: add a filter of text so that there's only 1 result that will be returned to us. we're not fetching all todos by not supplying a filter anymore. 
                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1); // i dont' get this line, if we have other entries in the db, this will fail. --done, it's now clear because we added the beforeEach() statement above which clears the whole database to a clean slate.
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
            })
    });

    // another test case that verifies a Todo data shouldn't be created if the client supplies invalid info
    it('should not create a Todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, response) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2); //update: change from 0 to 2 since we add 2 dummy todo objects. 
                    done()
                }).catch((err) => done(err));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done); // no need to add a function to end like above with POST/todo tests. This is because we don't have to do anything more. We already GOT the data we need to verify. As opposed to above, we POSTED data, then we still needed to retrieve data from the db to verify if the data is correct. Here, we just do a GET request to get all the data from the db and verify if it's correct.
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`) // convert the object id to a string using toHexString()
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for invalid object IDs', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});