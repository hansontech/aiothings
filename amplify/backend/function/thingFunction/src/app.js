/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION

Amplify Params - DO NOT EDIT *//*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require('aws-sdk')
var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const thing = require('./thing')
const edge = require('./edge')
const config = require('./config')
const applyModel = require("./utility")

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

const dynamodb = new AWS.DynamoDB.DocumentClient();


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
    if (query.briefOnly !== undefined) {
      thing.getThingGeneral(query.userId, query.certId, req.apiGateway.context, function(err,result) {
        if (err) {
          res.json({error: err})
        } else {
          res.json(result)
        }
      })      
    } else if (query.command !== undefined) { 
      if (query.command === 'get_properties') {
        const iot = new AWS.Iot()
        iot.describeEndpoint({endpointType: 'iot:Data-ATS'}, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              res.json({})
            } else {
              const endpointAddress = data.endpointAddress
              console.log('endpoint: ', endpointAddress)
              const iotdata = new AWS.IotData({endpoint: endpointAddress})
              iotdata.getThingShadow({
                thingName: query.thingName /* required */
                // shadowName: 'STRING_VALUE'
              }, function(err, data) {
                if (err) {
                  console.log(err, err.stack); // an error occurred
                  res.json({})
                } else {
                  console.log(data.payload);           // successful response
                  res.json(data.payload)
                }
              });
            }
        })
      }
    } else {
      thing.getThingDetail(query.userId, query.certId, query.thingName, query.thingId, req.apiGateway.context, function(err,result) {
        res.json(result)
      })
    }
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

// edge deploy status, TODO may need to change to /edgeStatus?
app.get('/edge/deploy', async function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  let deployId = null
  if (query.deployId !== undefined && query.deployId !== '') {
    deployId = query.deployId
  }
  try {
    let deployStatusData = await edge.getDeployStatus(deployId, JSON.parse(query.edgeData))
    res.json({deployStatus: deployStatusData})
  } catch (err) {
    console.log('deploy status err: ', err)
    res.json({error: err})
  }
});

app.get('/things/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

// -- device group
app.get('/devices', function(req, res) {
  // Add your code here
  // query { deviceGriupName, startDeviceId}
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  // console.log('get: query.userId: ', query.userId)
  if (query.deviceGroupName !== undefined) {
    if (query.deviceId !== undefined) {
      let params = {};
      partitionKeyName = 'DeviceGroupName'
      sortKeyName = 'DeviceId'
      params[partitionKeyName] = query.deviceGroupName
      params[sortKeyName] = query.deviceId
      dynamodb.get({
          TableName: config.deviceTableName,
          Key: params
      }, (err, data) => {
        if (err) {  // not found, means a new device group
          res.json({error: err})
          return
        }
        if (typeof data.Item === 'undefined'){
          res.json({error: 'the device group does not exist.'});
          return
        }
        let deviceItem = data.Item
        res.json(deviceItem)
      });
    } else {
      dynamodb.query({
        TableName: config.deviceTableName,
        KeyConditionExpression: '#deviceGroupName = :deviceGroupName',
        FilterExpression: 'attribute_not_exists(#isDeviceGroup)',
        ExpressionAttributeNames:{
            '#deviceGroupName': 'DeviceGroupName',
            '#isDeviceGroup': 'IsDeviceGroup'
        },
        ExpressionAttributeValues: {
            ':deviceGroupName': query.deviceGroupName
        }
      }, function(err, data) {
        if (err) {
          res.json({error: err})
          return
        }
        res.json(data.Items)
      })
    }  
  }else{
    res.json({error: 'Missing parameters'})
  }
  // res.json({success: 'get call succeed!', url: req.url});
});

app.get('/device-groups', function(req, res) {
  // { userId, deviceGroupName }
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  if (query.hasOwnProperty('deviceGroupName')) { // check if the device group name is exist
    let params = {};
    partitionKeyName = 'DeviceGroupName'
    sortKeyName = 'DeviceId'
    params[partitionKeyName] = query.deviceGroupName
    params[sortKeyName] = ' ' // empty space means the root entry of the device group
    dynamodb.get({
        TableName: config.deviceTableName,
        Key: params
    }, (err, data) => {
      if (err) {  // not found, means a new device group
        res.json({error: err})
        return
      }
      if (typeof data.Item === 'undefined'){
        res.json({error: 'the device group does not exist.'});
        return
      }
      let deviceGroup = data.Item
      if (query.hasOwnProperty('userId') && query.userId === deviceGroup.OwnerId && deviceGroup.CertId !== undefined) {
        // req.query.userid, req.query.certid
        thing.getThingDetail(deviceGroup.OwnerId, deviceGroup.CertId, deviceGroup.DeviceGroupName, deviceGroup.ThingId, req.apiGateway.context, function(err,result) {
          deviceGroup.Thing = result
          res.json(deviceGroup)
        })
      } else {
        res.json(deviceGroup)
      }
    });
  } else if (query.hasOwnProperty('userId')) {
    let userId = query.userId
    dynamodb.query({
      TableName: config.deviceTableName,
      IndexName: config.deviceOwnerIndexName,
      KeyConditionExpression: '#ownerid = :ownerid',
      FilterExpression: 'attribute_exists(#isDeviceGroup)',
      ExpressionAttributeNames:{
          '#ownerid': 'OwnerId',
          '#isDeviceGroup': 'IsDeviceGroup'
      },
      ExpressionAttributeValues: {
          ':ownerid': userId
      }
    }, function(err, data) {
      if (err) {
        res.json({error: err})
        return
      }
      res.json(data.Items)
    })
  } else {
    res.json({error: 'not enough parameters'});
  }
});

/****************************
* Example post method *
****************************/

app.post('/iot-allow', async function(req, res) {
  // Add your code here
  // let event = req.apiGateway.event
  // console.log('event :', event)
  console.log('req.body: ', req.body)
  var s3 = new AWS.S3()
  if (req.body.userId !== undefined && req.body.profile !== undefined) {
    try {
      let profile = req.body.profile
      profile.userId = req.body.userId
      profile.identityId = req.body.identityId
      var params = {
          Bucket: config.mserviceS3bucketName,
          Key: 'private/' + req.body.userId + '/.profile',
          Body: JSON.stringify(profile)
      };
      await s3.putObject(params).promise()
      console.log('set profile done')
    } catch (err) {
      console.log('set profile error: ', err)
    }
  }
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
  let firmware = null
  if (req.body.firmware !== undefined) {
    firmware = req.body.firmware
  }
  if (req.body.certId !== undefined) {
    thing.updateThing(req.body.userId, req.body.certId, req.body.name, req.body.thingId, req.body.desc, req.body.alertEnabled, firmware, req.apiGateway.context, function(err,result) {
      if (err !== null) {
        res.json({error: err})
      } else {
        res.json(result)
      }
    })
  }else {
    thing.createThing(req.body.userId, req.body.thingNameTag, req.body.desc, req.body.deviceGroupName, req.body.alertEnabled, req.apiGateway.context, function(err,result) {
      res.json(result)
    })
  }
 // res.json({success: req.body.userId})
});
app.post('/edge', async function(req, res) {
  // Add your code here
  // let event = req.apiGateway.event
  // console.log('event :', event)
  const utility = require("./utility")

  async function doUpdateEdge (req, edgeDataInput, edgeDefinitionInput) {
    try {
      let edgeData = await edge.updateEdge(req.body.userId, req.body.certId, edgeDataInput, edgeDefinitionInput)
      let edgeDefinition = await edge.getEdgeDetail(edgeData)
      let edgeObject = {edgeData: edgeData, edgeDefinition: edgeDefinition}
      // console.log('result: ', edgeObject)
      res.json(edgeObject)
    } catch (err) {
      console.log(err, err.stack)
      res.status(400).json(err)
    }
  }
  // console.log('body: ', req.body)

  let certs = await utility.dbGetCertinfoAsync(req.body.userId, req.body.certId)
  if (certs === null || certs.length === 0) {
      res.status(401).json({message: 'Cannot find the Thing object.'})
      return
  }
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

// -- device group
app.post('/devices', async function(req, res) {
  // Add your code here)
  // body { deviceGroupName, deviceId}
  if (req.body.deviceGroupName !== undefined && req.body.deviceId !== undefined) {
    let currentTime = new Date().getTime()
    try {
      let updatedData = await dynamodb.update({
        TableName: config.deviceTableName,
        Key:{
            'DeviceGroupName': req.body.deviceGroupName,
            'DeviceId': req.body.deviceId
        },
        UpdateExpression: 'set Created = :createdDate',
        ExpressionAttributeValues:{
            ':createdDate': currentTime
        },
        ReturnValues:'ALL_NEW'
      }).promise()
      res.json(updatedData.Attributes)
    } catch(err) {
      res.json({error: err})
    }
  } else {
    res.json({error: 'missing necessary parameters.'})
  }
});

app.post('/device-groups', function(req, res) {
  // Add your code here
  // let event = req.apiGateway.event
  // console.log('event :', event)
  console.log('userId: ', req.body.userId)
  let userId = req.body.userId
  let deviceGroupName = req.body.deviceGroupName
  thing.createDeviceGroup(userId, deviceGroupName, req.body.desc, req.apiGateway.context, function(err,thingResult) {
    if (err) {
      res.json({error: err})
      return
    }

    let item =  {
      'OwnerId': userId,
      'CertId': thingResult.CertId,
      'ThingId': thingResult.ThingId,
      'ThingName': thingResult.ThingName,
      'DeviceGroupDesc': req.body.desc,
      'DeviceGroupName': deviceGroupName,
      'IsDeviceGroup': true, // to indicate this is a device group entry
      'DeviceId': ' ' // for Device Group definition only
    }
    dynamodb.put({
      TableName: config.deviceTableName,
      Item: item
    }, function(err, data) {
      if (err) {
        res.json({error: err})
        return
      }
      item.Thing = thingResult
      res.json(item)
    });

  })
 // res.json({success: req.body.userId})
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

app.put('/devices', async function(req, res) {
  // Add your code here
  let body = req.body
  let device = body.device
  try {
    let updatedData = await dynamodb.put({
      TableName: config.deviceTableName,
      Item: device,
      ReturnValues:'ALL_OLD' // can only be ALL_OLD or NONE
    }).promise()
    res.json(updatedData)
  } catch(err) {
    res.json({error: err})
  }
});

app.put('/device-groups', async function(req, res) {
  // Add your code here
  let body = req.body
  let deviceGroup = body.deviceGroup
  let updateExpression = 'set DeviceGroupDesc = :deviceGroupDesc'
  let attrValues = {
    ':deviceGroupDesc': deviceGroup.DeviceGroupDesc
  }
  if (deviceGroup.BspFileName !== undefined) {
    updateExpression = updateExpression + ', BspFileName = :bspFileName'
    attrValues[':bspFileName'] = deviceGroup.BspFileName
  }
  try {
    if ((typeof deviceGroup === 'object') && deviceGroup.Firmware !== undefined && deviceGroup.Firmware.Desired !== undefined) {
      let firmware = deviceGroup.Firmware
      await applyModel.updateFirmware(null, null, firmware, 'fw_group_' + deviceGroup.DeviceGroupName, 'thinggroup', deviceGroup.DeviceGroupName)
      deviceGroup.Firmware.Processing = deviceGroup.Firmware.Desired
      delete deviceGroup.Firmware.Desired
      updateExpression = updateExpression + ', Firmware = :firmware'
      attrValues[':firmware'] = deviceGroup.Firmware
    } 
    let updatedData = await dynamodb.update({
      TableName: config.deviceTableName,
      Key:{
          'DeviceGroupName': deviceGroup.DeviceGroupName,
          'DeviceId': deviceGroup.DeviceId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: attrValues,
      ReturnValues:'ALL_NEW'
    }).promise()
    console.log('DeviceGroup New: ', updatedData.Attributes)
    res.json(updatedData.Attributes)
  } catch(err) {
    res.json({error: err})
  }
});


/****************************
* Example delete method *
****************************/

app.delete('/devices', async function(req, res) {
  // Add your code here
  // { deviceGroupName, deviceId }
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  if (query.hasOwnProperty('deviceId') && query.hasOwnProperty('deviceGroupName')) { // check if the device group name is exist
    let deletedData = null
    try {
      deletedData = dynamodb.delete({
        TableName: config.deviceTableName,
        Key: {
          DeviceGroupName: query.deviceGroupName,
          DeviceId: query.deviceId
        }
      }).promise()
    } catch (error) {
      console.log('delete device group err: ', error)
      res.json({error: error})
      return
    }
    res.json(deletedData)
  } else {
    res.json({error: 'missing necessary parameters'})
  }

});

app.delete('/device-groups', function(req, res) {
  // Add your code here
  // { userId, deviceGroupName }
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  if (query.hasOwnProperty('userId') && query.hasOwnProperty('deviceGroupName')) { // check if the device group name is exist
    let params = {};
    partitionKeyName = 'DeviceGroupName'
    sortKeyName = 'DeviceId'
    params[partitionKeyName] = query.deviceGroupName
    params[sortKeyName] = ' ' // empty space means the root entry of the device group
    dynamodb.get({
        TableName: config.deviceTableName,
        Key: params
    }, (err, data) => {
      if (err) {  // not found, means a new device group
        res.json({error: err})
        return
      }
      if (typeof data.Item === 'undefined'){
        res.json({error: 'the device group does not exist.'});
        return
      }
      let deviceGroup = data.Item
      if (query.hasOwnProperty('userId') && query.userId === deviceGroup.OwnerId && deviceGroup.CertId !== undefined) {
        thing.deleteThing(deviceGroup.OwnerId, deviceGroup.CertId, deviceGroup.ThingId, req.apiGateway.context, async function(err,result) {
          if (err) {
            console.log('delete thing err: ', err)
          }
          let deletedData = null
          try {
             await iot.deleteThingGroup({
                thingGroupName: deviceGroupName, /* required */
             }).promise().catch(function(err) {
                console.log('warning: ', err); // an error occurred
             })
             deletedData = dynamodb.delete({
              TableName: config.deviceTableName,
              Key: {
                DeviceGroupName: deviceGroup.DeviceGroupName,
                DeviceId: ' '
              }
            }).promise()
          } catch (error) {
             console.log('delete device group err: ', error)
             res.json({error: error})
             return
          }
          res.json(deletedData)
        })
      }
    })
  }
});

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
        await edge.deleteEdge(query.userId, query.certId, JSON.parse(query.edgeData))
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
