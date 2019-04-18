var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert'); 
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'GenerateChaincode';
// Collection Name
const collectName = 'ProjectInformation';
const uuidv1 = require('uuid/v1');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/getListOfAllProjects', function(req, res, next) {
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
   
    const db = client.db(dbName);
    const collection = db.collection(collectName);

    // Find all documents based on user Id
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      res.send(JSON.stringify(docs));  
    });
    client.close();
  });
});

router.post('/createProject',function(req,res,next){
  console.log("Inside Create project");
  //console.log(req.body);
  var body = req.body;//JSON.parse(req.body);
  console.log(body);

  var doc = {
    projectName:body.projectName,
    projectDescription:body.projectDescription,
    createdOn:moment().format('L'),
    projectId:uuidv1()
  }

  console.log(body);

  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    db.collection(collectName).find({projectName:doc.projectName}).toArray(function(err,docs){
      if(docs.length == 0){
        db.collection(collectName).insertOne(doc);
        res.status(200).send("Information created successfully!")
      }else {
        res.status(400).send("Project Name already present!")
      }
      client.close();
    })
  });
});

module.exports = router;