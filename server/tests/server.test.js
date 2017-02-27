// mocha and nodemon are not required to import. that's now how they are use if you can recall
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// this runs BEFORE EVERY TEST CASE 
beforeEach((done) => {
    Todo.remove({}).then(() => done());
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
            .end((err, response) => { // end the post request here but we're not passing done like we did in the previous lectures. we will pass in a func because we need to verify what got stored in our mongodb collection
                if (err) {
                    return done(err);
                }
                // verify the data in the db is correct
                Todo.find().then((todos) => {
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
                    expect(todos.length).toBe(0);
                    done()
                }).catch((err) => done(err));
            });
    });
});