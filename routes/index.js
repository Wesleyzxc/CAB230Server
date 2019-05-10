const express = require('express');
const mysql = require('mysql');

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'The World Database API' });
});

router.get('/search', function (req, res, next) {
  res.render('index', { title: 'Lots of route available' });
});

router.get('/register', function (req, res, next) {
  res.render('index', { title: 'Lots of route available' });
});

router.get('/login', function (req, res, next) {
  res.render('index', { title: 'Lots of route available' });
});

router.get("/api/offences", function (req, res) {
  req.db.from("offence_columns").select("pretty as offence")
    .then((rows) => {
      let reducedArray = []
      rows.map((row) => {
        reducedArray.push(row.offence);
      })
      res.json({ "Offences": reducedArray })
    })
    .catch((err) => {
      console.log(err);
      res.json({ "Error": true, "Message": "Error in MySQL query" })
    })
});


router.get("/api/areas", function (req, res, next) {
  req.db.from("areas").select("*")
    .then((rows) => {
      res.json({ "Error": false, "Message": "Success", "Local Government Areas": rows })
    })
    .catch((err) => {
      console.log(err);
      res.json({ "Error": true, "Message": "Error in MySQL query" })
    })
});

router.get("/api/areas/:LGA", function (req, res) {
  req.db.from("city").select("*").where("CountryCode", "=", req.params.CountryCode)
    .then((rows) => {
      res.json({ "Error": false, "Message": "Success", "Cities": rows })
    })
    .catch((er) => {
      console.log(err);
      res.json({ "Error": true, "Message": "Error executing MySQL query" })
    })

});

router.get("/api/areas/:LGA", function (req, res) {
  var query = "SELECT * FROM ?? WHERE ??=?";
  var table = ["city", "LGA", req.params.LGA];
  query = mysql.format(query, table);
  req.db.query(query, function (err, rows) {
    if (err) {
      res.json({
        "Error": true, "Message": "Error executing MySQL query"
      });
    } else {
      res.json({ "Error": false, "Message": "Success", "Cities": rows });
    }
  });
});





module.exports = router;
