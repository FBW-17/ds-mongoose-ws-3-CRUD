const express = require('express');
const app = express();
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// connect to mongo db with all this strange options
// so you do not get all these annyoing warnings on connecting
mongoose.connect('mongodb://localhost/users_db', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection succeeded')
    } else {
        console.log('Error on DB connection: ' + err)
    }
});

// Create User Model with schema
const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    roles: [String]
}));

// Create Todo model with schema
const Todo = mongoose.model("Todo", new mongoose.Schema({
    title: {type: String, required: true },
    status: { type: String, enum: ["OPEN", "IN PROCESS", "DONE", "ON HOLD", "CANCELED"], default: "OPEN" },
    user: {
        ref: "User", 
        type: mongoose.Schema.Types.ObjectId 
    }
}))

// parse incoming JSON data (from fetch or browser client)
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/user/:id/todos/seed', (req, res) => {
    let userId = req.params.id

    User.findById(userId).then(user => {
        if(user) {
            Todo.insertMany([
                { title: "ToDo 1", user: userId },
                { title: "ToDo 2", status: "ON HOLD", user: userId },
                { title: "ToDo 3", status: "DONE", user: userId },
            ]).then(todos => res.send(todos))
        }
        else {
            next("User does not exist")
        }
    }).catch(err => next(err))
})

app.get('/users/seed', (req, res) => {

    // array of users to create
    let users = [
        {email: "admin@dci.de", password: "admin", roles: ['Admin']},
        {email: "user1@dci.de", password: "pw1", roles: ['Guest']},
        {email: "user2@dci.de", password: "pw2", roles: ['Reader', 'Editor']},
    ]

    // hash password for each user (using bcrypt)
    let usersHashed = users.map(user => {
        user.password = bcrypt.hashSync(user.password, 10)
        return user
    })

    // insert users into MongoDB
    User.insertMany(usersHashed)
    .then(usersNew => res.send(usersNew)) 
})

// handle incoming LOGIN requests here....
app.post('/login', (req, res, next) => {

    // find user
    User.findOne({email: req.body.email}).then(user => {
        // user with this email not found? => error
        if(!user) {
            return next(`Authentication failed`)
        }

        // compare passwords using bcrypt.compare() function
        bcrypt.compare(req.body.password, user.password)
        .then(success => {
            // user password does not match password from login form? => error
            if(!success) {
                return next(`Authentication failed`)
            }
            // create JWT token by signing
            let secret = "jwt-master-secret"
            let token = jwt.sign(
                {id: user.id, email: user.email}, // WHAT data to sign
                secret, // signing key
                { expiresIn: "1h" } // expiry time
            )
    
            // return token
            res.send({ token }) // => same as: { "token": token }
        })
    })
    .catch(err => next(err))
})


let port = 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}!`);
});

//Run app, then load http://localhost:port in a browser to see the output.