//All your code goes in this file
const express = require("express");
const Datastore = require("nedb");

// this is confusing me too
//const { res } = require("express");
//const fetch = require("node-fetch");

const app = express();

app.use(express.static("public")); //problem

const db = new Datastore("database.db");
app.use(express.json());

db.loadDatabase();

//get request
app.get("/api", (req, res) => {
  db.find({})
    .sort({ contents: -1 })
    .exec(function (err, data) {
      if (err) {
        console.log("error with app.get /api -line 19");
        res.status(400).send(err);
        res.end();
        return;
      } else {
        res.json(data);
        res.status(200).end();
      }
    });
});

//post request

app.post("/api", (req, res) => {
  const data = req.body;
  console.log(data);
  if (data.lead_item) {
    db.insert(data, (err, insertedData) => {
      res.status(201).json(insertedData);
    });
  } else {
    res.status(400).json({ error: "Bad Request - No Match Found" });
  }
});

//search request
app.get("/api/search", (req, res) => {
  db.find(req.query, (err, data) => {
    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(400);
      res.json({
        error: "Bad request",
      });
    }
  });
});

// put request

/*
app.put("/api/:id", (req, res) => {
  const id = req.params.id;
  const data = req.body;
  db.update({ _id: id }, data, {}, (err, numReplaced) => {
    if (err) {
      res.status(400).json({ error: "Bad Request" });
    } else {
      res.json(data);
    }
  });
});
*/

app.put("/api/:id", (req, res) => {
  let options = {
    upsert: true,
    returnUpdatedDocs: true,
  };
  let data = req.body;
  let ID = req.params.ID;
  data._id = ID;
  if (Object.keys(data).includes("lead_item")) {
    db.update(
      { _id: ID },
      data,
      options,
      (err, numAffected, affectedDocument, upsert) => {
        if (upsert) {
          res.status(201).json(affectedDocument);
        } else {
          res.status(200).json(affectedDocument);
        }
      }
    );
  } else {
    res.status(400).json({ error: "Bad Request - something went wrong" });
  }
});

// delete request
app.delete("/api/:id", function (req, res) {
  db.remove({ _id: req.params.id }, function (err, num) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    if (num === 0) {
      res.json(404, { error: { message: "no id found: " + req.params.id } });
      return;
    }

    res.send(204);
  });
});

//TO DO:

//BROKEN STUFF

app.post("/api", (req, res) => {
  console.log(req.body);
  const data = req.body;
  console.log(data.contents);
  db.insert(data);
  res.send({
    status: "success",
    contents: data.contents,
  });
});

app.post("/api", (req, res) => {
  const data = req.body;
  console.log(data.first);
  db.remove({ contents: data.first }, {}, function (err, numRemoved) {
    console.log(numRemoved);
  });
  res.json({
    status: "success",
  });
});

//rewrite pulling from api here

const fetch = require("cross-fetch");

async function loadData() {
  let url = "https://api.opencovid.ca/";
  let obj = await (await fetch(url)).json();
  console.log(obj);
}

loadData();

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = app;
