const express = require("express");
const mysql = require("mysql");

const router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "The World Database API" });
});

router.post("/search", function(req, res, next) {
  // res.render('index', { title: 'Lots of route available' });
  // let token = req.headers['x-access-token'];
  // if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  // req.jwt.verify(token, req.cf.secret, function(err, decoded) {
  //   if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  //   res.status(200).send(decoded);
  // });
  let results = [];
  req.db
    .from("offences")
    .select("area", "sum(${req.body.offence}")
    .groupBy("area")
    .then(rows => {
      results.push(rows);
    });
});

router.post("/api/login", function(req, res, next) {
  let returnToken = "";
  function CheckLogin(setToken) {
    req.db
      .from("users")
      .select("password")
      .where({ email: req.body.email })
      .then(data => {
        req.bc.compare(req.body.password, data[0].password, function(err, res) {
          token = req.jwt.sign({ id: req.body.email }, req.cf.secret, {
            expiresIn: 86400
          }); // expires in 24 hours
          // console.log(token);
          setToken = token;
        });
      });
  }

  CheckLogin(returnToken);
  console.log(returnToken);
  res.status(200).send({"token": returnToken});
});

// console.log(token);
// res.json({"token": token})
// res.status(200).send({ "token": token });

// res.send(token);

//   req.bc.compare(req.body.password, hashedPassword, function(err, res) {
//     // res == true
//     console.log(res);
// })
//   req.db.from('users').select("email", "id").where({ email: req.body.email }).where({password: req.body.password}).then((data) => {
//     console.log(data);
//     let token = req.jwt.sign({ id: req.body.email }, req.cf.secret, {
//       expiresIn: 86400 // expires in 24 hours
//     });

//     res.json({ "Error": false, "Message": "Success", "Email": data[0].email, "Token": token });

//   })
//     .catch((err) => {
//       console.log("Your account does not exist.");
//       res.status(401);
//       res.json({ "message": "invalid login." });
//     });

router.post("/api/register", function(req, res, next) {
  // res.render('index', { title: 'Lots of route available' });
  // body is  x-www-form-urlencoded
  let hashedPassword = req.bc.hashSync(req.body.password, 8);
  // console.log(hashedPassword);
  // let second = req.bc.hashSync("demouserpassword", 8);
  // console.log(second);

  req
    .db("users")
    .insert({ email: req.body.email, password: hashedPassword })
    .then(data => {
      console.log(data); // just the id
      res.status(200).send({ message: "you successfully registered" });
    })
    .catch(err => {
      console.log("Your account already exists.");
      res.status(400);
      res.json({ message: "this user exists." });
    });
});

router.get("/api/offences", function(req, res) {
  req.db
    .from("offence_columns")
    .select("pretty as offence")
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.offence);
      });
      res.json({ Offences: reducedArray });
    })
    .catch(err => {
      console.log(err);
      res.json({ Error: true, Message: "Error in MySQL query" });
    });
});

router.get("/api/areas", function(req, res, next) {
  req.db
    .from("areas")
    .select("*")
    .then(rows => {
      res.json({
        Error: false,
        Message: "Success",
        "Local Government Areas": rows
      });
    })
    .catch(err => {
      console.log(err);
      res.json({ Error: true, Message: "Error in MySQL query" });
    });
});

router.get("/api/ages", function(req, res, next) {
  req.db
    .from("offences")
    .select("age")
    .distinct()
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.age);
      });
      res.json({ Error: false, Message: "Success", Age: reducedArray });
    })
    .catch(er => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

router.get("/api/years", function(req, res, next) {
  req.db
    .from("offences")
    .select("year")
    .distinct()
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.year);
      });
      res.json({ Error: false, Message: "Success", Year: reducedArray });
    })
    .catch(er => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

router.get("/api/genders", function(req, res, next) {
  req.db
    .from("offences")
    .select("gender")
    .distinct()
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.gender);
      });
      res.json({ Error: false, Message: "Success", Gender: reducedArray });
    })
    .catch(er => {
      console.log(err);
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

module.exports = router;
