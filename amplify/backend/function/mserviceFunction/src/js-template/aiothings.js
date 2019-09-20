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

let messagePublishWithTopic = async (topic, messageData) => {
    if (senderId !== 'admin' && senderId !== 'system') {
        return
    }
    let theSenderId = senderId
    let dataString = JSON.stringify(messageData);
    var iotdata = new AWS.IotData({endpoint: environment.IOT_ENDPOINT});
    var params = {
        topic: 'aiot/' + theSenderId + '/' + environment.MSERVICE_NAME + '/' + topic,
        payload: dataString,
        qos: 0
        };
    try {
        await iotdata.publish(params).promise();
    } catch (e) {
        console.log('message publish error: ', e);
    }
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

let intervalsObjectName = 'aiot_intervals'
let setInterval = async (periodTime, messageTopic, messageData, numberOfTimes) => {
    if (periodTime <=0 || numberOfTimes <=0) {
        return
    }
    if (numberOfTimes > 10) {
        numberOfTimes = 10
    }
    let intervalsObj = await storeGetObject(intervalsObjectName)
    if (intervalsObj === null) {
        intervalsObj = {}
    }
    let startTime = new Date().getTime() / 1000 // in seconds
    startTime = Math.trunc(startTime)
    intervalsObj[messageTopic] = {sender: senderId, microservice: environment.MSERVICE_NAME, period: periodTime, topic: messageTopic, data: messageData, startFrom: startTime, countLeft: numberOfTimes}
    await storePutObject(intervalsObjectName, intervalsObj)

    let cloudWatchEvents = new AWS.CloudWatchEvents()
    let cloudWatchRuleName = 'aiotMinuteTimerCloudWatchRule'
    try {
        let ruleData = await cloudWatchEvents.putRule({
            Name: cloudWatchRuleName, /* required */
            ScheduleExpression: "rate(1 minute)",
            State: 'ENABLED'
        }).promise()
        let ruleArn = ruleData.RuleArn
        let lambda = new AWS.Lambda()
        let addPermissionPromise = lambda.addPermission({
            Action: "lambda:InvokeFunction", 
            FunctionName: "aiotMinuteScheduler", 
            Principal: "events.amazonaws.com", 
            SourceArn: ruleArn, 
            StatementId: "aiotMinuteSchedulerPermission"
        }).promise()
        /*
        await lambda.createEventSourceMapping({
            EventSourceArn: ruleArn,
            FunctionName: 'aiotMinuteScheduler',
        }).promise()
        */
        await addPermissionPromise.catch( function (err) { 
            console.log('addPermission: error: ', err); // an error occurred
          });
        let targetsData = await cloudWatchEvents.listTargetsByRule({
            Rule: cloudWatchRuleName
        }).promise()
        if (targetsData.Targets.length === 0) {
            await cloudWatchEvents.putTargets({
                Rule: cloudWatchRuleName,
                Targets: [
                    {
                        // Arn: 'arn:aws:states:ap-southeast-2:414327512415:stateMachine:atTimerStepMachine', /* required */
                        Arn: 'arn:aws:lambda:ap-southeast-2:414327512415:function:aiotMinuteScheduler',
                        Id: 'aiotMinuteTimerCloudWatchRuleTarget', /* required */
                        // RoleArn: 'arn:aws:iam::414327512415:role/aiotCloudWatchEventTargetsRole'
                    }
                ]
            }).promise()
        }
        if (periodTime < 60) {
            stepFunctionClient = new AWS.StepFunctions()
            await stepFunctionClient.startExecution({
                stateMachineArn: 'arn:aws:states:ap-southeast-2:414327512415:stateMachine:atTimerStepMachine'
            }).promise()
        }
    } catch (err) {
        console.log('error: ', err)
    }
};

let clearInterval = async (messageTopic) => {
    let intervalsObj = await storeGetObject(intervalsObjectName)
    if (intervalsObj === null) {
        return
    }
    if (intervalsObj.hasOwnProperty(messageTopic)) {
        delete intervalsObj[messageTopic]
    }
    await storePutObject(intervalsObjectName, intervalsObj)
    if (intervalsObj.length > 0) {
        return
    }
    let cloudWatchEvents = new AWS.CloudWatchEvents()
    let cloudWatchRuleName = 'aiotMinuteTimerCloudWatchRule'
    try {
        await cloudWatchEvents.disableRule({
            Name: cloudWatchRuleName /* required */
        }).promise()
    } catch (err) {
        console.log('error: ', err)
    }
}
let getIntervals = async () => {
    let intervalsObj = await storeGetObject(intervalsObjectName)
    return intervalsObj
}

let updateIntervals = async (intervalsObj) => {
    await storePutObject(intervalsObjectName, intervalsObj)
}

let consoleOutput = async (outputMessage) => {
    var event = inputEvent;
    let dataString = JSON.stringify(outputMessage);
    var iotdata = new AWS.IotData({endpoint: environment.IOT_ENDPOINT});
    let sendTo = senderId
    // Send to the ms' owner if the ms is running by system
    if (senderId === 'admin' || senderId === 'system') {
        sendTo = environment.OWNER_ID
    }
    var params = {
        topic: 'aiot/' + sendTo + '/' + environment.MSERVICE_NAME + '/' + 'console/output',
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
        if (environment.hasOwnProperty('SYSTEM_MSERVICE') && environment.SYSTEM_MSERVICE === 'true') {
            senderId = 'system'
        } else if (environment.hasOwnProperty('OWNER_ID')) {
            senderId = environment.OWNER_ID
        } else {
            senderId = 'system'
        }     
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
  messageQueueSend,
  clearInterval,
  setInterval,
  getIntervals
};