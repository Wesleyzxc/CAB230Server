const express = require("express");
const router = express.Router();

/**
 * Login API with email and password in body which is hashed
 * 
 */
router.post("/login", function (req, res, next) {
    if (req.body.email === undefined || req.body.password === undefined) {
        return res.status(401).json({
            "message": "invalid login - you need to supply both an email and password"
        })
    }
    // SQL: select password from users where email = req.body.email
    req.db.from("users").select("password").where({ email: req.body.email })
        .then(data => {
            if (data) { return data[0].password }
            // catch bad email
            else { throw new Error({ message: "oh no! It looks like there was a database error while creating your user, give it another try..." }) };
        })
        .then(response => {
            let token = req.bc.compare(req.body.password, response)
                .then(response => {
                    // token is verified
                    if (response) {
                        let token = req.jwt.sign({ id: req.body.email }, process.env.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        return token;
                    }
                    // catch bad password
                    else { res.status(401).send({ message: "invalid login- bad password" }) };
                })
            return token;
        })
        .then(result => {
            if (result) {
                res.status(200).send({"token" : result, "access_token": result, "token_type": "Bearer", "expiresIn": 86400 });
            }
            // shouldn't be here
            else { res.status(401).send({ message: "invalid login- bad password" }) }
        })
        .catch(function (err) {
            if (err.message === "Cannot read property 'password' of undefined") {
                res.status(401).send({
                    "message": "oh no! It looks like that user doesn't exist..."
                });
            }


        })

});

/**
 * Register API with email and password which will be hashed before storing in DB
 * 
 */
router.post("/register", function (req, res, next) {

    if (req.body.email === undefined || req.body.password === undefined) {
        return res.status(400).json({
            "message": "error creating new user - you need to supply both an email and password"
        })
    }

    // body is  x-www-form-urlencoded
    // standard hashing password before storing in database
    let hashedPassword = req.bc.hashSync(req.body.password, 8);
    // SQL: insert into users values(email=req.body.email, password=hashedPassword)
    req.db("users").insert({ email: req.body.email, password: hashedPassword })
        .then(data => {
            // console.log(data); // just the id
            res.status(200).send({
                message: "yay! you've successfully registered your user account :)"
            });
        })
        .catch(err => {
            // unable to insert due to duplicate keys
            res.status(400).send({ message: "oops! It looks like that user already exists :(" });
        });
});

module.exports = router;
