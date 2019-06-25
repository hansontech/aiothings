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

// Load the SDK for JavaScript
const AWS = require('aws-sdk');

var config = {
  mserviceTableName: "atServiceTable",
  relationTableName: "atRelationTable",
  mserviceTableIndexByUserId: "UserId-index",
  mserviceTableIndexByInputMessageTopic: "InputMessageTopic-index",
  mserviceTableIndexBySharedUserId: "IsShared-UserId-index",
  region: "ap-southeast-2",
  mserviceS3bucketName: "aiot-bucket" + '-' + process.env.ENV,
  mserviceRole: "arn:aws:iam::414327512415:role/aiot-mservice-role-default",
  awsIotEndpoint: "a3vgppxo7lddg8-ats.iot.ap-southeast-2.amazonaws.com",
};
AWS.config.update({region: config.region});

let s3 = new AWS.S3({params: {Bucket: config.mserviceS3bucketName}, region: config.region});

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


app.get('/ifttt/v1/status', async function(req, res) {
  // Add your code here
  let configData = await aiotStoreGet('ifttt/config.json');
  console.log('config: ', configData)
  console.log('req headers: ', req.headers)
  let serviceKey = req.headers['ifttt-service-key']
  console.log('serviceKey: ', serviceKey)

  if (serviceKey !== null && configData !== null && configData.hasOwnProperty('Services')) {
    let services = configData.Services;
    if ( services.hasOwnProperty(serviceKey)) {
      res.json({success: 'get call succeed!', url: req.url});
    } else {
      res.status(401).json({errors: [{ message: 'invalid service key'}]});
    } 
  } else {
    res.status(401).json({errors: [{ message: 'service key is not set yet'}]});
  }
  
  async function aiotStoreGet (objectName) {
    let params = {
        Bucket: config.mserviceS3bucketName,
        Key: 'public/' + objectName
    };
    let data = null;
    try {
        data = await s3.getObject(params).promise();
    } catch (err) {
        console.log('aiotStoreGet:', err);
        return null
    }
    return JSON.parse(data.Body);
  };

});

app.get('/ifttt/v1/status/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/ifttt/v1/user/info', async function(req, res) {
  // Add your code here
  /* test
  let dataString = JSON.stringify({success: 'ok'});
  var iotdata = new AWS.IotData({endpoint: config.awsIotEndpoint});
  var params = {
        topic: 'aiot/' + 'admin' + '/' + 'test6/input',
        payload: dataString,
        qos: 0
        };
  try {
      await iotdata.publish(params).promise();
  } catch (e) {
      console.log('message publish error: ', e);
  } 
  */
 let cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()
 let authHeader = req.headers.authorization
 let accessToken = authHeader.split(' ')[1]
 let params = {
   AccessToken: accessToken /* required */
 };
 let userData = null
 try {
   userData = await cognitoidentityserviceprovider.getUser(params).promise()
 } catch (err) {
     console.log(err, err.stack); // an error occurred
 }
 if (userData === null) {
   res.status(401).json({errors: [{ message: 'invalid access token'}]});
 } else {
   console.log(userData)
   res.json({success: 'ok', data: {name: userData.Username, id: userData.Username}});
   // username field is actually unique Cognito user ID
 }
});

app.get('/ifttt/v1/user/info/*', async function(req, res) {
  // Add your code here
  res.json({success: 'ok', data: {name: 'Dennis Kung', id: 'denniskung68'}});
});

/****************************
* Example post method *
****************************/

app.post('/ifttt/v1/status', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/ifttt/v1/status/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/ifttt/v1/test/setup', async function(req, res) {
  // Add your code here
  let configData = await aiotStoreGet('ifttt/config.json');
  console.log('config: ', configData)
  console.log('req headers: ', req.headers)
  let serviceKey = req.headers['ifttt-service-key']
  console.log('serviceKey: ', serviceKey)

  if (serviceKey !== null && configData !== null && configData.hasOwnProperty('Services')) {
    let services = configData.Services;
    if ( services.hasOwnProperty(serviceKey)) {
      res.json({ 
        success: 'post call succeed!', 
        data: {
          accessToken: 'eyJraWQiOiJNNHNRMDM2N2JHS1lKVVdvamhXUjRhUjJManpQXC9UbFlcL1hxT2ZkY29DTUk9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJiMGZhMzZiNC1jZTcyLTRmYzItYmFkOS0wMjExMmNhZmY1MTciLCJjb2duaXRvOmdyb3VwcyI6WyJhcC1zb3V0aGVhc3QtMl9WSnA1cWM3TGtfRmFjZWJvb2siXSwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiBvcGVuaWQgcHJvZmlsZSIsImF1dGhfdGltZSI6MTU0ODgxMzYwMiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0yLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC0yX1ZKcDVxYzdMayIsImV4cCI6MTU0ODgxNzIwMiwiaWF0IjoxNTQ4ODEzNjAyLCJ2ZXJzaW9uIjoyLCJqdGkiOiI3MGQ2MmYzYi1hMjVlLTQ2NTUtYjRiYi1mNjY3Y2VhMjRjYTMiLCJjbGllbnRfaWQiOiI2NDk4NmVzamFhMG1hM3M2bGM1b24zZGRrcCIsInVzZXJuYW1lIjoiRmFjZWJvb2tfMTAyMTI2ODM0MjE1MDA1OTcifQ.C3iU411peJ3CBEWG_SX16-ckSn2gNnf1BaIRUo4oNhpV940dYEAuvNFz35yh3rScBh0QkvnQ_japSps8I0XOLVpcF5nTd33icZEldsVIp3MuJPPMbVZOG3TVqJjf6VHs8Y3k80Sf7XbATqP9bCfr0auqC4bgWv8DIMJwIThFOgYn3jAA3LEflmdgg0hqn-XSd62Ey52RiKQxmBdbOhv2AJRERPhvhs8lANZAlymoi5M-9yynDT8RhgqvlvAHhTxzAI6o0C76tnM_-7P0ZZ-iHu3Y2nPIbaChyE5mI2N8x4yPO8oYG3QPeQs2-iSzQJo-0mUo6B9CWmKEVyklWUrOSQ',
          samples: { 
            triggers: { new_thing_created: { thing_status: 'good'}}, 
            actions: { create_new_thing: { thing_status: 'good too'}}
          }
        }
      })
    } else {
      res.status(401).json({errors: [{ message: 'invalid service key'}]});
    } 
  } else {
    res.status(401).json({errors: [{ message: 'service key is not set yet'}]});
  }

  async function aiotStoreGet (objectName) {
    let params = {
        Bucket: config.mserviceS3bucketName,
        Key: 'public/' + objectName
    };
    let data = null;
    try {
        data = await s3.getObject(params).promise();
    } catch (err) {
        console.log('aiotStoreGet:', err);
        return null
    }
    return JSON.parse(data.Body);
  };
});

let messageQueueName = (triggerActionName, statusExtension) => {
    if (statusExtension !== '') {
      return 'aiotIftttTrigger_' + triggerActionName + '_' + statusExtension
    } else {
      return 'aiotIftttTrigger_' + triggerActionName
    }
};

app.post('/ifttt/v1/triggers/:trigger_name', async function(req, res) {
  // Add your code here
  let cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()
  let authHeader = req.headers.authorization
  let accessToken = authHeader.split(' ')[1]
  let params = {
    AccessToken: accessToken /* required */
  };
  let userData = null
  try {
    userData = await cognitoidentityserviceprovider.getUser(params).promise()
  } catch (err) {
    console.log(err, err.stack); // an error occurred
  }
  if (userData === null) {
    res.status(401).json({errors: [{ message:'invalid access token'}]});
  } else {
    console.log(userData)
    let userId =  userData.Username
    // username field is actually unique Cognito user ID

    let triggerName = req.params.trigger_name
    let statusExtension = ''
    if (req.body.hasOwnProperty('triggerFields')) {
       if (req.body.triggerFields.hasOwnProperty('thing_status')) {
         statusExtension = req.body.triggerFields.thing_status
       }
    }
    let sqs = new AWS.SQS()
  
    let queueName = messageQueueName(triggerName, statusExtension)
    let params = {
      QueueName: queueName, /* required */
    };
    let sqsQueueUrl = null
    try {
      let queueUrlData = await sqs.getQueueUrl(params).promise()
      sqsQueueUrl = queueUrlData.QueueUrl;
    } catch (errGetQueueUrl) {
      console.log(errGetQueueUrl, errGetQueueUrl.stack); // an error occurred
      res.json({data: []})
      return
    }

    let receiveMessageParams = {
        QueueUrl: sqsQueueUrl,
        AttributeNames: [ 'All' ],
        MaxNumberOfMessages: 9, // how many messages to retrieve in a batch
        VisibilityTimeout: 10,  // in s, how long until these messages are available to another consumer
        WaitTimeSeconds: 0     // how many seconds to wait for messages before continuing 
        };
    let receivedData = null
    let messages = []
    let deleteMessageEntries = []
    let zeroCounted = 0
    let index = 0
    let deleteMessageIdBase = 'deleteMessageId' + (new Date()).getTime()
    while ( zeroCounted < 2 && index < 100 ) {
      let dateNow = (new Date()).toISOString()
      try {
        receivedData = await sqs.receiveMessage(receiveMessageParams).promise()
      } catch (receiveMessageErr) {
        console.log(receiveMessageErr, receiveMessageErr.stack); // an error occurred
        res.json({data: []})
        break
      }
      if (receivedData !== null && receivedData.hasOwnProperty('Messages')) {
        for (let message of receivedData.Messages) {
          let messageBodyJson = JSON.parse(message.Body)
          messageBodyJson.meta = { id: message.MessageId, timestamp: Number(message.Attributes['SentTimestamp'])}
          messageBodyJson.created_at = dateNow 
          messages.push(messageBodyJson)
        }
        for (let message of receivedData.Messages) {
          deleteMessageEntries.push({ Id: deleteMessageIdBase + index, timestamp: Number(message.Attributes['SentTimestamp']), ReceiptHandle: message.ReceiptHandle});
          index = index + 1
        }
      }else{
        zeroCounted = zeroCounted + 1
      }
    } // end of while loop
    // console.log('messages: ', messages)
    // ordered descending
    messages.sort(function(a, b) { 
      return b.meta.timestamp - a.meta.timestamp;
    })
    /* according to IFTTT definition, no need to delete ?? */
    /* TODO temporarilly disabled */
    if (messages.length > 50) {
        deleteMessageEntries.sort(function(a, b) { 
          return a.timestamp - b.timestamp;
        })
        deleteMessageEntries.length = messages.length - 50
        messages.length = 50  // simply adjust the length up to 50
        for (let message of deleteMessageEntries) {
          delete message.timestamp
        }
        let messageEntries = []
        for (let message of deleteMessageEntries) {
          messageEntries.push(message)
          if (messageEntries.length === 10) {
            let deleteMessageParams = {
              QueueUrl: sqsQueueUrl,
              Entries: messageEntries
            };
            try {
              await sqs.deleteMessageBatch(deleteMessageParams).promise()
            } catch (deleteMessageErr) {
              console.log(deleteMessageErr, deleteMessageErr.stack); // an error occurred
            }
            messageEntries = []
          }
        }
        if (messageEntries.length > 0) {
          let deleteMessageParams = {
            QueueUrl: sqsQueueUrl,
            Entries: messageEntries
          };
          try {
            await sqs.deleteMessageBatch(deleteMessageParams).promise()
          } catch (deleteMessageErr) {
            console.log(deleteMessageErr, deleteMessageErr.stack); // an error occurred
          }
        }
    } 
    res.json({success: 'ok', data: messages})

    /* old implementation
    sqs.getQueueUrl(params, function(err, data) {
      if (err){
        console.log(err, err.stack); // an error occurred
        res.json({data: []})
      } else {
         // AWS SQS examples
         // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html
         console.log(data);           // successful response
         let sqsQueueUrl = data.QueueUrl;
         sqs.receiveMessage({
          QueueUrl: sqsQueueUrl,
          AttributeNames: [ 'All' ],
          MaxNumberOfMessages: 9, // how many messages to retrieve in a batch
          VisibilityTimeout: 10,  // in s, how long until these messages are available to another consumer
          WaitTimeSeconds: 0     // how many seconds to wait for messages before continuing 
          }, async function(err1, data) {
            let dateNow = (new Date()).toISOString()
              if (err1) {
                console.log(err1, err1.stack); // an error occurred
                res.json({data: [], created_at: dateNow})
              } else {
                  console.log('received message data: ', data);           // successful response
                  let messages = []
                  if (data !== null && data.hasOwnProperty('Messages')) {
                    for (let message of data.Messages) {
                      let messageBodyJson = JSON.parse(message.Body)
                      messageBodyJson.meta = { id: message.MessageId, timestamp: message.Attributes['SentTimestamp']}
                      messages.push(messageBodyJson)
                    }
                    // according to IFTTT definition, no need to delete ?? 
                    // TODO temporarilly disabled
                    let deleteMessageEntries = []
                    let index = 0
                    for (let message of data.Messages) {
                      messages.push(message.Body)
                      deleteMessageEntries.push({ Id: 'deleteMessageId' + index, ReceiptHandle: message.ReceiptHandle});
                      index = index + 1
                    }
                    var params = {
                      QueueUrl: sqsQueueUrl,
                      Entries: deleteMessageEntries
                    };
                    try {
                      await sqs.deleteMessageBatch(params).promise()
                    } catch (err2) {
                      console.log(err2, err2.stack); // an error occurred
                    }
                  }
                  res.json({success: 'ok', data: messages, created_at: dateNow })
                } // end if else
              }); // end receiveMessage
      } // end of if
    }); // end of getQueueUrl  
    */
  } // end if else has userId
   // res.json({success: 'post call succeed!', data: [ {thing_status: 'ok 1'}, {thing_status: 'ok 2'}, {thing_status: 'ok 3'}]})
});

let messagePublish = async (req, userId) => {
  let actionName = req.params.action_name
  let messageData = req.body.actionFields
  let dataString = JSON.stringify(messageData);
  let iotdata = new AWS.IotData({endpoint: config.awsIotEndpoint});
  let params = {
      topic: 'aiot/' + userId + '/iftttFunction/ifttt/input/' + actionName,
      payload: dataString,  //  for example: {\"thing_status\":\"line\"}
      qos: 0
      };

  try {
      await iotdata.publish(params).promise();
  } catch (e) {
      console.log('message publish error: ', e);
  }
};

app.post('/ifttt/v1/actions/:action_name', async function(req, res) {
  // Add your code here
  if (req.body.hasOwnProperty('actionFields') === false) {
    res.status(400).json({ errors: [ { message: 'cannot find action fields'}]})
  } else {
    let actionFields = req.body.actionFields
    if (Object.keys(actionFields).length < 1) {
      res.status(400).json({ errors: [ { message: 'no any pair from action fields'}]})
    } else {
      let cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()
      let authHeader = req.headers.authorization
      let accessToken = authHeader.split(' ')[1]
      let params = {
        AccessToken: accessToken /* required */
      };
      let userData = null
      try {
        userData = await cognitoidentityserviceprovider.getUser(params).promise()
      } catch (err) {
        console.log(err, err.stack); // an error occurred
      }
      if (userData === null) {
        res.status(401).json({errors: [{ message: 'invalid access token'}]});
      } else {
        console.log(userData)
        let userId =  userData.Username
        await messagePublish(req, userId)
        let uniqueId = (new Date()).toISOString()
        res.json({success: 'ok', data: [ {id: uniqueId}] })
      }
    }
  }

});

/****************************
* Example post method *
****************************/

app.put('/ifttt/v1/status', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/ifttt/v1/status/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/ifttt/v1/status', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/ifttt/v1/status/*', function(req, res) {
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
