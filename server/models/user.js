const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// this is what the user model would look like
// {
//     email: 'test@test.com',
//     password: 'some hashed password',
//     tokens: [{
//         access: 'auth',
//         token: 'some hashed token'
//     }]
// }

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true, // this makes sure that the email is unique. we can't have register with an email that's already taken
        lowercase: true,
        validate: { // we need to validate the email is legit using a custom validator and an npm module called validator 
            validator: validator.isEmail, // ask about this line , why does this automatically pass in the value argument -- edit, it seems that it implicitly passed the value to the isEmail(value) function. -- waiting for response if this is an ES6 feature.  
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        // tokens can only be done with mongoDB. it doesn't work on sql dbs such as postgres
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

// this is how to create an instance method for a schema 
// we don't use an arrow function because it doesn't bind the 'this' keyword to the document itself. 
UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123'); // we will eventually move the secret salt to a config file. 

    // save the access type and token to the user's tokens array
    user.tokens.push({ access, token });

    // save this user's tokens to the database as well
    return user.save().then(() => {
        return token; // this is the token const above which will get passed to the caller 
    }); // we basically return a promise to whoever calls this function. that promise will get passed the token from line 58 in its fulfilled handler. Usually we return another promise when chaining promises, but returning a value is completely legal too. 
};

UserSchema.methods.toJSON = function () {
    // this gets called whenever a mongoose model gets converted to a json value. so here we can control what gets sent back to the client. basically this gets called whenever res.send() is called with a an object
    var user = this;
    var userObject = user.toObject() // we need to convert user to an object first so we can use lodash's pick function on it. 

    return _.pick(userObject, ['_id', 'email']); // return only the id and email
};

// statics instead of instance method
UserSchema.statics.findByToken = function (token) {
    var User = this; // this does not refer to the instance, it refers to the model User.
    var decoded; // set to null by default
    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        // verify throws an error if the verification fails
        // if it reaches here, return a promise that always fails
        // return new Promise((resolve, reject) => {
        //     reject();
        // });

        // shorthand
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth' // this is how you compare nested properties: by using single quotes
        // ask why we didn't need to specify the index of the array for tokens. done - this is because of the syntax, it basically looks through ALL elements in the array with the filter we provided. 
    });
}

// mongoose middleware that gets called before we save the User model to the db
UserSchema.pre('save', function (next) {
    var user = this;

    // there are going to be times where we update the user object without modifying its password. Which means the password has already been hashed before. We don't want to hash a hashed password any further because this would just cause our verification to fail 
    // we just want to hash the password if it gets modified.
    if (user.isModified('password')) { // returns true if property is modified, false if otherwise
        // hash the password here
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next(); // just do nothing and proceed
    }
});

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise ((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    resolve(user); // this is the user that gets passed to the server.js POST /users/login
                } else {
                    reject(); // this triggers the catch block
                }
            });
        });
    });
};

const User = mongoose.model('User', UserSchema);

// export the model 
module.exports = { User };