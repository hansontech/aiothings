/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const thing = require('./thing');
const edge = require('./edge')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


/**********************
 * Example get method *
 **********************/

app.get('/things', function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  // console.log('get: query.userId: ', query.userId)
  if (query.certId !== undefined) {
    // req.query.userid, req.query.certid
    thing.getThingDetail(query.userId, query.certId, query.thingName, query.thingId, req.apiGateway.context, function(err,result) {
      res.json(result)
    })
  }else{
     thing.listThings(query.userId, req.apiGateway.context, function(err,result) {
      res.json(result)
    })
  }
  // res.json({success: 'get call succeed!', url: req.url});
});

app.get('/edge/definition', async function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  try {
    let edgeDefinition = await edge.getEdgeDetail(JSON.parse(query.edgeData))
    res.json({edgeDefinition: edgeDefinition})
  } catch (err) {
    res.status(400).json(err)
  }
});

app.get('/edge/deploy/status', async function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  try {
    let deployStatusData = await edge.getDeployStatus(query.deployId, JSON.parse(query.edgeData))
    res.json({deployStatus: deployStatusData})
  } catch (err) {
    console.log('deploy status err: ', err)
    res.status(400).json(err)
  }
});

app.get('/things/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/iot-allow', function(req, res) {
  // Add your code here
  // let event = req.apiGateway.event
  // console.log('event :', event)
  console.log('identityId: ', req.body.identityId)
  thing.allowUserIoT(req.body.identityId, function(err,result) {
      res.json(result)
  })
  
 // res.json({success: req.body.userId})
});

app.post('/things', function(req, res) {
  // Add your code here
  // let event = req.apiGateway.event
  // console.log('event :', event)
  console.log('userId: ', req.body.userId)

  if (req.body.certId !== undefined) {
    thing.updateThing(req.body.userId, req.body.certId, req.body.name, req.body.desc, req.apiGateway.context, function(err,result) {
      res.json(result)
    })
  }else {
    thing.createThing(req.body.userId, req.body.thingNameTag, req.body.desc, req.apiGateway.context, function(err,result) {
      res.json(result)
    })
  }
 // res.json({success: req.body.userId})
});
app.post('/edge', async function(req, res) {
  // Add your code here
  // let event = req.apiGateway.event
  // console.log('event :', event)
  async function doUpdateEdge (req, edgeDataInput, edgeDefinitionInput) {
    try {
      let edgeData = await edge.updateEdge(req.body.userId, req.body.certId, edgeDataInput, edgeDefinitionInput)
      let edgeDefinition = await edge.getEdgeDetail(edgeData)
      let edgeObject = {edgeData: edgeData, edgeDefinition: edgeDefinition}
      console.log('result: ', edgeObject)
      res.json(edgeObject)
    } catch (err) {
      console.log(err, err.stack)
      res.status(400).json(err)
    }
  }
  console.log('body: ', req.body)
  if ((req.body.hasOwnProperty('edgeData') === false) || (req.body.edgeData.hasOwnProperty('ggGroup') === false)) {
    // means newly created from empty, need to create a group first
    console.log('start edge create')
    edge.createEdge(req.body.userId, req.body.certId, req.body.thingNameTag, req.body.thingId, req.body.edgeDefinition, async (err, edgeData, edgeDefinition) => {
      if (err) {
        console.log(err, err.stack)
        res.status(400).json(err)
      } else {
        console.log('start edge update: ', edgeData)
        await doUpdateEdge(req, edgeData, edgeDefinition)
      }
    })
  } else {
    console.log('start edge update 2')
    await doUpdateEdge(req, req.body.edgeData, req.body.edgeDefinition)
  }
});

app.post('/edge/deploy', async function(req, res) {
  // Add your code here  
  try {
    let deployData = await edge.deployEdge(req.body.edgeData)
    res.json(deployData)
  } catch (err) {
    console.log('edge deploy err: ', err)
    res.status(400).json(err)
  }
});

app.post('/things/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/things', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/things/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/things', function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  console.log('delete: query: ', query.userId, ': ', query.certId, ': ', query.thingId)
  thing.deleteThing(query.userId, query.certId, query.thingId, req.apiGateway.context, function(err,result) {
    res.json(result)
  })
  // res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/edge', async function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  try{
      if (query.edgeData !== undefined) {
        await edge.deleteEdge(query.userId, query.certId, query.edgeData)
      }
      res.json({success: 0})
  } catch (err) {
      res.status(400).json(err)
  }
});

app.delete('/things/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
