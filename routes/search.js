const express = require("express");
const router = express.Router();

/**
 * Search API that has token in header and queries in body
 **/
router.get("/search", function (req, res, next) {
	if (!req.query.offence) {
		return res.status(400).send({"error": "oops! it looks like you're missing the offence query parm"});
	}
	if (!req.headers['authorization']) return res.status(401).send({"error": "oops! it looks like you're missing the authorization header"});
    let offence = req.query.offence.replace(/ /g, "").replace(/[^a-zA-Z ]/g, "");
	
    let token = req.headers['authorization'].replace("Bearer ", "");
    let result = [];
    // SQL: select offences.area, lat,lng, sum(offence) as total from offences join areas on areas.area = offenecs.area
    let query = req.db.select("offences.area", "lat", "lng").sum(`${offence} as total`).from("offences").innerJoin("areas", "areas.area", "offences.area")

    // Handling header token 
    
    req.jwt.verify(token, process.env.secret, function (err, decoded) {
        if (err) {
            return res.status(401).send({"error": "oh no! it looks like your authorization token is invalid..."});
        }
        else {
			// if user entered non-pretty offence
			req.db.select("offence_columns.column").from("offence_columns").where("pretty", `${req.query.offence}`)
				.then(rows => {
					if (rows.length === 0) {
						return res.status(500).json({
                            "error": "oh no! It looks like there was a database error while performing your search, give it another try...",
                            "e": {}
                        })
					}
				})
            // adds where clause to sql query based on parameters
            if (req.query.area) {
                query = query.having("area", '=', `${req.query.area}`)
            };
            if (req.query.age) {
                query = query.where("age", `${req.query.age}`);

            };
            if (req.query.gender) {
                query = query.where("gender", `${req.query.gender}`);

            };
            if (req.query.year) {
                query = query.where("year", `${req.query.year}`);

            };
            if (req.query.month) {
                query = query.where("month", `${req.query.month}`);

            };
            query.groupBy("areas.area").groupBy("areas.lat").groupBy("areas.lng")
                .then(rows => {

                    if (rows.length === 0) { throw new Error("Parameters not correct") };
                    rows.map(row => {
                        result.push({ "LGA": row.area, "total": row.total, "lat": row.lat, "lng": row.lng });
                    })
                    res.status(200).json({ "query": req.query, result });
                })
                .catch(err => {
                    if (err.toString().includes("Error: Parameters not correct")) {
                        return res.status(200).json({ "query": req.query, "result": [] })
                    }
                    else if (req.query.offence.length != 0) {
                        return res.status(500).json({
                            "error": "oh no! It looks like there was a database error while performing your search, give it another try...",
                            "e": {}
                        })
                    }
                    return res.status(400).json({ "message": "oops! it looks like you're missing the offence query parm" })
                });
        }
    })

});

module.exports = router;
