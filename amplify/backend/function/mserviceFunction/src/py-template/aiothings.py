import boto3
import os
import json
import time

inputEvent = {'sender' : 'nobody'}
senderId = 'undefined'

def messagePublishWithTopic(sender, microservice, topic, messageData):
    if (senderId != 'admin' and senderId != 'system'):
        return
    client = boto3.client('iot-data') # os.environ['IOT_ENDPOINT']
    dataString = json.dumps(messageData, separators=(',',':')) # compact, counterpart loads    
    # response = 
    client.publish(
        topic= 'aiot/' + sender  + '/' + microservice + '/' + topic,
        qos=1,
        payload= dataString
    )
    # print('response: ', response)

def messagePublish(messageData, forceToSender=''):
    if (os.environ['OUTPUT_MESSAGE_TOPIC'] == 'null'):
        return
    global inputEvent
    # event = inputEvent
    client = boto3.client('iot-data') # os.environ['IOT_ENDPOINT']
    if (os.environ['IS_SHARED'] == 'true'):
        messageData.mserviceOwnerId = os.environ['OWNER_ID']
        messageData.mserviceName = os.environ['MSERVICE_NAME']
    else:
        del messageData.mserviceOwnerId
    theSenderId = senderId
    if (forceToSender != ''):
        if (os.environ['SYSTEM_MSERVICE'] == 'true'):
            theSenderId = forceToSender
    dataString = json.dumps(messageData, separators=(',',':')) # compact, counterpart loads    
    # response = 
    client.publish(
        topic= 'aiot/' + theSenderId + '/' + os.environ['MSERVICE_NAME'] + '/' + os.environ['OUTPUT_MESSAGE_TOPIC'],
        qos=1,
        payload= dataString
    )
    # print('response: ', response)

def storeGetObject(objectName):
    resultData = None
    try:
        client = boto3.client('s3')
        data = client.get_object(Bucket = os.environ['S3_BUCKET'], Key = 'private/' + objectName)
        jsonString = data['Body'].read()
        resultData = (json.loads(jsonString))  # json.loads(data['Body'])
        print('get object: ', resultData)
    except Exception as err:
        print('object error: ', err)
        resultData = None
    return  resultData

def storePutObject(objectName, data):
    try:
        client = boto3.client('s3')
        dataString = json.dumps(data, separators=(',', ': '))
        client.put_object(Bucket = os.environ['S3_BUCKET'], Key = 'private/' + objectName, Body = dataString)
    except Exception as err:
        print(err)

def consoleOutput(outputMessage):
    global inputEvent
    # event = inputEvent
    client = boto3.client('iot-data') # os.environ['IOT_ENDPOINT']
    dataString = json.dumps(outputMessage, separators=(',',':')) # compact, counterpart loads
    sendTo = senderId
    if senderId == 'admin' or senderId == 'system':
        sendTo = os.environ['OWNER_ID']
    client.publish(
        topic= 'aiot/' + sendTo + '/' + os.environ['MSERVICE_NAME'] + '/' + 'console/output',
        qos=1,
        payload= dataString
    )

intervalsObjectName = 'aiot_intervals'
cloudWatchRuleName = 'aiotMinuteTimerCloudWatchRule'
 
def setInterval(periodTime, messageTopic, messageData, numberOfTimes):
    if periodTime <=0 or numberOfTimes <= 0:
        return
    if numberOfTimes > 10:
        numberOfTimes = 10
    intervalsObj = storeGetObject(intervalsObjectName)
    if intervalsObj is None:
        intervalsObj = {}
    startTime = time.time() # in seconds
    intervalsObj[messageTopic] = {'sender': senderId, 'microservice': os.environ['MSERVICE_NAME'], 'period': periodTime, 'topic': messageTopic, 'data': messageData, 'startFrom': startTime, 'countLeft': numberOfTimes}
    storePutObject(intervalsObjectName, intervalsObj)
    try:
        client = boto3.client('events')
        client.put_rule(Name= cloudWatchRuleName,
            ScheduleExpression= "rate(1 minute)",
            State= 'ENABLED'
        )
        targetsData = client.list_targets_by_rule(Rule= cloudWatchRuleName)
        if len(targetsData.Targets) == 0:
            # Call aiotMinuteScheduler microservice every one minute
            client.put_targets(
                Rule= cloudWatchRuleName,
                Targets= [
                    {
                        # 'Arn': 'arn:aws:states:ap-southeast-2:414327512415:stateMachine:atTimerStepMachine',
                        'Arn': 'arn:aws:lambda:ap-southeast-2:414327512415:function:aiotMinuteScheduler',
                        'Id': 'aiotMinuteTimerCloudWatchRuleTarget',
                        # 'RoleArn': 'arn:aws:iam::414327512415:role/aiotCloudWatchEventTargetsRole'
                    }
                ]
            )
        if periodTime < 60:
            stepFunctionClient = boto3.client('stepfunctions')
            stepFunctionClient.start_execution(stateMachineArn= 'arn:aws:states:ap-southeast-2:414327512415:stateMachine:atTimerStepMachine')
    except Exception as err:
        print(err)
   
def clearInterval(messageTopic):
    intervalsObj = storeGetObject(intervalsObjectName)
    if intervalsObj is None:
        return
    if messageTopic in intervalsObj:
        del intervalsObj[messageTopic]
    # if hasattr(intervalsObj, messageTopic):
    #    delattr(intervalsObj, messageTopic)
    storePutObject(intervalsObjectName, intervalsObj)
    if len(intervalsObj) > 0:
        # if there are still existing intervals, then keep running scheduler
        return
    # otherwise, if no more intervals defined, then deactivate the scheduler
    try:
        client = boto3.client('events')
        client.disable_rule(Name = cloudWatchRuleName)
    except Exception as err:
        print(err)

def getIntervals():
    intervalsObj = storeGetObject(intervalsObjectName)
    if intervalsObj is None:
        try:
            client = boto3.client('events')
            client.disable_rule(Name= cloudWatchRuleName)
        except Exception as err:
            print(err)
    return intervalsObj

def updateIntervals(intervalsObj):
    storePutObject(intervalsObjectName, intervalsObj)

def setInput(event):
    global inputEvent
    global senderId
    inputEvent = event
    if 'sender' not in event:
        if ('SYSTEM_MSERVICE' in os.environ) and os.environ['SYSTEM_MSERVICE'] == 'true':
            senderId = 'system'
        elif 'OWNER_ID' in os.environ:
            senderId = os.environ['OWNER_ID']
        else:
            senderId = 'system'
        return
    senderId = event['sender']
    if (event['sender'] == 'admin' or event['sender'] == 'system'):
        senderId = os.environ['OWNER_ID']