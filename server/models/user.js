const mongoose = require('mongoose');

// challenge create a new model for the User collection 
// User: email - required, trimmed, string type, minlength 1
const User = mongoose.model('User', {
    email: {
        type: String,
        require: true,
        minlength: 1,
        trim: true
    }
});


// export the model 
module.exports = {User};

// const newUser = User({
//     email: '   test@email.com     '
// });
// newUser.save().then((doc) => {
//     console.log(JSON.stringify(doc, undefined, 2));
// }, (e) => {
//     console.log('Unable to save User: ', e);
// });
