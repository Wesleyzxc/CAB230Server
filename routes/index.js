const express = require("express");

const router = express.Router();

/* GET home page which passes on to swaggerUI */
router.get("/", function (req, res, next) {
  next();
});

router.get("/search", function (req, res, next) {
  let token = req.headers['x-access-token'];
  let results = [];
  // SQL: select offences.area, lat,lng, sum(offence) as total from offences join areas on areas.area = offenecs.area
  let query = req.db.select("offences.area", "lat", "lng").sum(`${req.body.offence} as total`).from("offences").innerJoin("areas", "areas.area", "offences.area")
  parameters = {
    "offence": req.body.offence
  };

  // Handling header token 
  if (!token) return res.status(401).send({ auth: false, error: 'Looks like the authorization header is missing!' });
  req.jwt.verify(token, req.cf.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
    else {

      // adds where clause to sql query based on parameters
      if (req.body.area) { query = query.where("area", `${req.body.area}`) };
      if (req.body.age) {
        query = query.where("age", `${req.body.age}`);
        parameters = Object.assign(parameters, { "age": req.body.age });
      };
      if (req.body.gender) {
        query = query.where("gender", `${req.body.gender}`);
        parameters = Object.assign(parameters, { "gender": req.body.gender });
      };
      if (req.body.year) {
        query = query.where("year", `${req.body.year}`);
        parameters = Object.assign(parameters, { "year": req.body.year });
      };
      if (req.body.month) {
        query = query.where("month", `${req.body.month}`);
        parameters = Object.assign(parameters, { "month": req.body.month });
      };
      query.groupBy("area")
        .then(rows => {
          if (rows.length === 0) { throw new Error("Parameters not correct") };
          rows.map(row => {
            results.push({ "LGA": row.area, "total": row.total, "lat": row.lat, "lng": row.lng });
          })
          res.status(200).json({ "query": parameters, "results": { results } });
        })
        .catch(err => {
          return res.status(400).json({ "message": "something is wrong with your parameters!" })
        });
    }
  })

});

router.post("/login", function (req, res, next) {
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
            let token = req.jwt.sign({ id: req.body.email }, req.cf.secret, {
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
        res.status(200).send({ "access-token": result, "token_type": "Bearer", "expiresIn": 86400 });
      }
      // shouldn't be here
      else { res.status(401).send({ message: "invalid login- bad password" }) }
    })
    .catch(function (err) {
      if (err.message === "Cannot read property 'password' of undefined") {
        res.status(401).send({ message: "oh no! It looks like there was a database error while creating your user, give it another try..." });
      }


    })

});


router.post("/register", function (req, res, next) {
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
