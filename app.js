//All your code goes in this file
const express = require("express");
const Datastore = require("nedb")

const app = express();
app.use(express.json());
app.use(express.static('public'))
const db = new Datastore("./database.db")
db.loadDatabase()

// get api 

app.get('/api', (req, resp) => {
    let data = db.find({}, (err, doc) => {
        if(err) {
            console.log("ERROR")
        } else {
            console.log(doc)
            resp.json(doc);
        }
    })
})

//get request / seatch

app.get('/api/search', (req, resp) => {
    db.find(req.query, (err, doc) => {
        if(err || doc.length == 0) {
            resp.status(400).json({ error: 'haha didnt work'});
        } else {
            console.log(doc)
            resp.json(doc);
        }
    })
})

//post request 

app.post('/api', function (req, res) {  
    let keys = Object.keys(req.body)

    if(keys.includes("name")){
        db.insert(req.body, (err, newDoc) => {
            res.status(201).json(newDoc);
        })
    } else {
        res.status(400).json({ error: 'Post error /api - Bad Request'});
    }
})

//put request

app.put('/api/:id', (req, res) => {
    let id = req.params.id;
    let data = req.body;
    let keys = Object.keys(req.body)
    if(keys.includes("name")){
        data._id = id;
    db.update({_id: id}, data, {upsert:true, returnUpdatedDocs:true}, (err, num, doc, upsert) => {
        if(upsert) {
            res.status(201)
        } else {
            res.status(200)
        }
        res.json(doc)
        })} else {
            res.status(400).json({ error: 'error in app.put /api/id (bad request)'})
        }
})

//delete request 

app.delete('/api/:id', (req, resp) => {
    let id = req.params.id;
        db.remove({_id: id}, {}, (err, num) => {
            if(num) {
                resp.status(204);
                resp.end();
            } else {
                resp.status(404).json({ error: 'error with delete request (ID not found)'});
            }
        })
})
    //res.json(response);
    //res.end();

    //rewrite pulling from api here

    const fetch = require("cross-fetch");

async function loadData() {
  let url = "https://api.opencovid.ca/"; // maybe fix this later
  let obj = await (await fetch(url)).json();
  console.log(obj);
}

loadData();
//res.status(200);

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = app;
