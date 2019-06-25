const AWS = require('aws-sdk');

const environment = process.env;

var inputEvent = {sender : 'nobody'};
var senderId = 'undefined'

let storeGetObject = async (objectName) => {
    let s3 = new AWS.S3();
    let params = {
        Bucket:  environment.S3_BUCKET,
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

let storePutObject = async (objectName, data) => {
    let s3 = new AWS.S3();
    let dataString = JSON.stringify(data)
    let params = {
      Bucket: environment.S3_BUCKET,
      Key: 'public/' + objectName,
      Body: dataString
    };
    try {
      await s3.putObject(params).promise()
    } catch (err) {
      console.log('aiotStorePut:', err);
    }
}
  
let messageQueueSend = async (queueName, messageData) => {
    let sqs = new AWS.SQS();
    console.log('messageData: ', messageData)
    let dataString = JSON.stringify(messageData);
    try {
        let queueUrlData = await sqs.getQueueUrl({ QueueName: queueName }).promise()
        console.log('found queueUrl')
        let queueUrl = queueUrlData.QueueUrl
        let params = {
            MessageBody: dataString, /* required */
            QueueUrl: queueUrl, /* required */
            DelaySeconds: 0,
            MessageAttributes: {
               'Title': {
                  DataType: 'String',
                  StringValue: 'demo'
                 }
            }
        }
        await sqs.sendMessage(params).promise()
    } catch (err) {
        // means cannot find the queue
      	console.log(err, err.stack); // an error occurred
        console.log('create new queue: ', queueName);
        try {
            let data = await sqs.createQueue({QueueName: queueName}).promise();
            let queueUrl = data.QueueUrl
            let params = {
                MessageBody: dataString, /* required */
                QueueUrl: queueUrl, /* required */
                DelaySeconds: 0,
                MessageAttributes: {
                   'Title': {
                      DataType: 'String',
                      StringValue: 'demo'
                     }
                }
            }
            await sqs.sendMessage(params).promise()
            // await iftttRealtimeApi(event.iftttServiceKey)	//  TODO ifttt service key
        } catch (err) {
            console.log(err, err.stack); // an error occurred
        }
    }   // if try failed, cannot find the queue name
};

let messagePublish = async (messageData, forceToSender) => {
    if (environment.OUTPUT_MESSAGE_TOPIC === 'null') {
        return
    }
    let event = inputEvent
    if (environment.hasOwnProperty('IS_SHARED') && environment.IS_SHARED === 'true') {
        messageData.mserviceOwnerId = environment.OWNER_ID
        messageData.mserviceName = environment.MSERVICE_NAME
    } else {
        delete messageData.mserviceOwnerId
    }
    let theSenderId = senderId
    if (typeof forceToSender !== 'undefined') {
        if (environment.hasOwnProperty('SYSTEM_MSERVICE') && environment.SYSTEM_MSERVICE === 'true') {
            theSenderId = forceToSender
        }
    }
    let dataString = JSON.stringify(messageData);
    var iotdata = new AWS.IotData({endpoint: environment.IOT_ENDPOINT});
    var params = {
        topic: 'aiot/' + theSenderId + '/' + environment.MSERVICE_NAME + '/' + environment.OUTPUT_MESSAGE_TOPIC,
        payload: dataString,
        qos: 0
        };
    try {
        await iotdata.publish(params).promise();
    } catch (e) {
        console.log('message publish error: ', e);
    }
};

let consoleOutput = async (outputMessage) => {
    var event = inputEvent;
    let dataString = JSON.stringify(outputMessage);
    var iotdata = new AWS.IotData({endpoint: environment.IOT_ENDPOINT});
    var params = {
        topic: 'aiot/' + senderId + '/' + + environment.MSERVICE_NAME + '/' + 'console/output',
        payload: dataString,
        qos: 0
        };
    try {
        await iotdata.publish(params).promise();
    } catch (e) {
        console.log('message publish error: ', e);
    }
};

let setInput = (event) => {
    inputEvent = event;
    
    if ( process.env.hasOwnProperty('API_GATEWAY_NAME') && event.hasOwnProperty('path') ) {
        let apiNamePart = /^\/[0-9a-zA-Z\-\_]+\//
        event.path = event.path.replace(apiNamePart, '/')
    }
    
    if (event.hasOwnProperty('sender') === false) {
        senderId = environment.OWNER_ID
        return
    }
    senderId = event.sender
    if (event.sender === 'admin' || event.sender === 'system') {
        senderId = environment.OWNER_ID
    }
    
};

module.exports = {
  messagePublish,
  consoleOutput,
  setInput,
  storeGetObject,
  storePutObject,
  messageQueueSend
};