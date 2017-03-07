const bcrypt = require('bcryptjs');

var password = '123abc!';

// we need to generate a salt then we can hash it
bcrypt.genSalt(10, (err, salt) => { //1st arg: number of rounds you want to use to generate the salt
    // bcyrpt is inherently slow and that's a good thing which is going to prevent brute force attacks. The bigger the number of rounds, the longer the algorithm is going to take. Some devs use 120 rounds to intentionally make bcyrpt longer so no one can brute force these calls. adding unnecessary length to your API is not a good idea but when it comes to passwords, it's a good idea as this will prevent anyone to make a million request/second. This greatly reduces the chance of someone bruteforcing the passwords successfully. 
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash); // the hash value has a lot of information stored inside of it such as the number of rounds. 
    });
});


// to verify a password
var hashedPassword = '$2a$10$Y0AvorvlDa/29lTf0NTBDenutWsqVXK7yqCzXQmEzoOYT72.BKfAW';
bcrypt.compare(password, hashedPassword, (err, result) => {
    console.log(result); // result will be true if it matches, else will be false
});