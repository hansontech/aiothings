import boto3
import os
import json

inputEvent = {'sender' : 'nobody'}
senderId = 'undefined'

def messagePublish(messageData, forceToSender=''):
    if (os.environ['OUTPUT_MESSAGE_TOPIC'] == 'null'):
        return
    global inputEvent
    event = inputEvent
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
    response = client.publish(
        topic= 'aiot/' + theSenderId + '/' + os.environ['MSERVICE_NAME'] + '/' + os.environ['OUTPUT_MESSAGE_TOPIC'],
        qos=1,
        payload= dataString
    )
    # print('response: ', response)

def consoleOutput(outputMessage):
    global inputEvent
    event = inputEvent
    client = boto3.client('iot-data') # os.environ['IOT_ENDPOINT']
    dataString = json.dumps(outputMessage, separators=(',',':')) # compact, counterpart loads
    response = client.publish(
        topic= 'aiot/' + senderId + '/' + os.environ['MSERViCE_NAME'] + '/' + 'console/output',
        qos=1,
        payload= dataString
    )

def setInput(event):
    global inputEvent
    global senderId
    inputEvent = event
    senderId = event['sender']
    if (event['sender'] == 'admin' or event['sender'] == 'system'):
        senderId = os.environ['OWNER_ID']
