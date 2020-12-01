const express = require("express");
const router = express.Router();

/**
 * Offence API that returnrs all searchable offences
 */
router.get("/offences", function (req, res) {
  // SQL: select pretty as offence from offence_columns
  req.db.from("offence_columns").select("pretty as offence")
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.offence);
      });
      res.json({ offences: reducedArray });
    })
    .catch(err => {
      // Shouldn't be here unless changes in db
      res.json({ Error: true, Message: "Error in MySQL query" });
    });
});

/**
 * Area API that returnrs all searchable areas
 */
router.get("/areas", function (req, res, next) {
  // SQL: select area from areas
  req.db.from("areas").select("area")
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.area);
      });
      res.json({ areas: reducedArray });
    })

    .catch(err => {
      // Shouldn't be here unless changes in db
      res.json({ Error: true, Message: "Error in MySQL query" });
    });
});


/**
 * Age API that returnrs all searchable ages
 */
router.get("/ages", function (req, res, next) {
  // SQL to reflect changes in db: select distinct age from offences 
  req.db.from("offences").select("age").distinct()
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.age);
      });
      res.json({ ages: reducedArray });
    })
    .catch(err => {
      // Shouldn't be here unless changes in db
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

/**
 * Year API that returnrs all searchable years
 */
router.get("/years", function (req, res, next) {
  // SQL to reflect changes in db: select distinct year from offences
  req.db.from("offences").select("year").distinct()
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.year);
      });
      res.json({ years: reducedArray });
    })
    .catch(err => {
      // Shouldn't be here unless changes in db
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

router.get("/genders", function (req, res, next) {
  // SQL to reflect changes in db: select distinct gender from offences
  req.db.from("offences").select("gender").distinct()
    .then(rows => {
      let reducedArray = [];
      rows.map(row => {
        reducedArray.push(row.gender);
      });
      res.json({ genders: reducedArray });
    })
    .catch(er => {
      // Shouldn't be here unless changes in db
      res.json({ Error: true, Message: "Error executing MySQL query" });
    });
});

module.exports = router;
