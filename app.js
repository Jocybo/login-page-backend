const express = require('express');
const jwt = require('jsonwebtoken');
const mongodb = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const { json } = require('express/lib/response');
const { verify } = require('jsonwebtoken');
const mongoClinet = mongodb.MongoClient;
const URL = "mongodb+srv://Naveen:naveen21@cluster0.c3oly.mongodb.net/?retryWrites=true&w=majority"

const app = express();
app.use(express.json());

app.use(cors({
    orgin: "*"
})
);

function authenticate(req, res, next) {
    if (req.headers.authorization) {
        let decode = jwt.verify(req.headers.authorization, "hereisthesecretkey")
        if (decode) {
            next()
        } else {
            res.status(401).json({ message: "Unauthorized" })
        }
    } else {
        res.status(401).json({ message: "Unauthorized" })
    }
}

/* function verifyToken(req, res, next) {
    //get Auth Header Value :
    const userHeader = req.headers['authorization'];
    // Check if User is undefined :
    if (typeof userHeader !== 'undefined') {

    } else {
        res.sendstatus(403)
    }

} */

app.post('/api', authenticate, (req, res) => {
    res.json({ message: "post created" })
})

app.post('/home',authenticate, (req, res) => {
    res.json({ message: "Welcome" })
})

app.post("/register", async (req, res) => {
    //open the connection :
    try {
        let connection = await mongoClinet.connect(URL);
        let db = (await connection).db("task");

        // Password Encrypted using bcryptjs :

        let salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash;

        await db.collection("users").insertOne(req.body)
        res.json({ message: "User Created" })
        await db.connection.close()
    } catch (error) {
        res.status(500).json({ message: "someting wrong" })
    }

})

app.post("/login", async (req, res) => {

    try {
        // Open the Connection :
        let connection = await mongoClinet.connect(URL);
        // Select the DB :
        let db = connection.db("task");
        // Fetch user with email id  from Db:
        let user = await db.collection("users").findOne({ email: req.body.email });
        if (user) {
            // if email id is correct checking the password :
            let compare = bcrypt.compareSync(req.body.password, user.password);
            if (compare) {
                // given password == DB password + Genarate JWT token :
                let token = jwt.sign({ name: user.name, id: user._id }, "hereisthesecretkey");
                res.json({ token })
            } else {
                res.status(500).json({ message: "Password Not Found" })
            }
        } else {
            res.status(401).json({ message: "User Not Found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something Went Wrong" })
    }

})

app.listen(3002, () => {
    console.log("web server started");
})