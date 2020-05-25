'''
/*
 * Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
 '''
import os
import sys
import threading
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import logging
import time
import argparse
import subprocess
import json

class DeviceThread(threading.Thread):  # Inherit Thread class
    def __init__(self, thingName, client, FIFO_aiot2device = '/tmp/pipe_aiot2device', FIFO_device2aiot = '/tmp/pipe_device2aiot'):
        threading.Thread.__init__(self)
        self._FIFO_aiot2device = FIFO_aiot2device
        self._FIFO_device2aiot = FIFO_device2aiot
        self._client = client
        self._thingName = thingName
        self._deviceResponseHandlers = {}
        try:
            os.mkfifo(self._FIFO_aiot2device)
        except OSError:
            pass
    def run(self):
        # wait for response from device
        threading.Thread(target=self.deviceResponse).start()
        if self._thingName == '' or self._thingName == ' ':
            # using temporary certificate, need request cloud for a dedicated certificate
            self._client.subscribe('aiot/certificates/create/accepted', 1, self.deviceCertReceived)
            self._client.subscribe('aiot/certificates/create/rejected', 1, self.deviceCertRejected)
            self.deviceRequest(self, 
                { 'topic': 'device_id/request' },
                'device_id/response',
                lambda self, response: (
                    self._publishToCloud('aiot/certificates/create', response['payload'])))
        else:
            # start normal operation
            self._client.subscribe('aiot/' + self._thingName + '/aiot_device/request', 1, self.deviceRequestFromCloud)
            self._client.subscribe('aiot/' + self._thingName + '/alive/req', 1, self.deviceAlive)
        while True:
            time.sleep(5)
    def messagePrint(self, client, userdata, message):
        print("Received a new message: ")
        print(message.payload)
        print("from topic: ")
        print(message.topic)
        print("--------------\n\n")
    def createFile(self, filename, dataStr):
        try:
            if os.path.exists(filename) and os.path.isfile(filename):
                timeStampStr = str(long(os.path.getmtime(filename)))
                os.rename(filename, filename + '-' + timeStampStr + '.bak')
            fileObject = open(filename, "w")
            fileObject.write(dataStr)
            fileObject.close()
        except OSError as err:
            print("OS error: {0}".format(err))
        except:
            print("Unexpected error:", sys.exc_info()[0])

    def deviceCertReceived(self, client, userdata, message):
        # https://docs.amazonaws.cn/en_us/iot/latest/developerguide/provision-wo-cert.html
        # {
        #     "certificateId": "string",
        #     "certificatePem": "string",
        #     "privateKey": "string",
        #     "thingName": string
        #     -- "certificateOwnershipToken": "string"
        # }
        newThingName = message.payload.thingName
        newCertificatePath = self.createFile('/root/aiothings/aiot-' + newThingName + '-certificate.crt', message.payload.certificatePem)
        newPrivateKeyPath = self.createFile('/root/aiothings/aiot-' + newThingName + '-private.key', message.payload.privateKey)
        # update config data to new settings
        newConfigDict = {}
        newConfigDict['certificatePath'] = newCertificatePath
        newConfigDict['privateKeyPath'] = newPrivateKeyPath
        newConfigDict['thingName'] = newThingName
        newConfigDict['endpoint'] = configDict['endpoint'] # from previous setting
        # overwrite configuration file wirh new config settings
        newConfigFileData = json.dumps(newConfigDict)
        with open(configFile, "w") as configFileObject:
            configFileObject.write(newConfigFileData)
            configFileObject.close()
        # reboot system
        outResult = subprocess.Popen(['reboot'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        stdout, stderr = outResult.communicate()
    def deviceCertRejected(self, client, userdata, message):
        # {
        #     "statusCode": int,
        #     "errorCode": "string",
        #     "errorMessage": "string"
        # }
        self.messagePrint(client, userdata, message)

    def deviceAlive(self, client, userdata, message):
        topicAliveResponse = 'aiot/' + self._thingName + '/alive/resp'
        # https://cmdlinetips.com/2014/03/how-to-run-a-shell-command-from-python-and-get-the-output/
        outResult = subprocess.Popen(['curl', '-s', 'ifconfig.me'], 
           stdout=subprocess.PIPE, 
           stderr=subprocess.STDOUT)
        stdout, stderr = outResult.communicate()
        ipAddr = stdout
        self._client.publishAsync(topicAliveResponse, '{ "hostIp": "' + ipAddr + '" }', 1)

    def deviceRequestFromCloud(self, client, userdata, message):
        # https://stackoverflow.com/questions/1233448/no-multiline-lambda-in-python-why-not/1233520#1233520
        # https://stackoverflow.com/questions/27244073/how-to-use-lambda-as-method-within-a-class
        self.deviceRequest(
            {'topic': 'device_status/request'}, 
            'device_status/response',
            lambda self, response: (
                self._publishToCloud('aiot/' + self._thingName + '/aiot_device/response', response['payload'])))
 
    def _publishToCloud(topic, payload):
        self._client.publishAsync(topic, json.dumps(payload), 1)

    def deviceRequest(self, message, responseTopic, responseHandler):
        # message.topic
        self._deviceResponseHandlers[responseTopic] = responseHandler
        messageStr = json.dumps(message)
        try:
            with open(self._FIFO_aiot2device, 'w') as fifoOut:
                fifoOut.write(messageStr)
                fifoOut.close()
        except OSError as err:
            print("OS error: {0}".format(err))
        except:
            print("Unexpected error:", sys.exc_info()[0])

    def deviceResponse(self):
        try:
            os.mkfifo(self._FIFO_device2aiot)
        except OSError:
            pass
        while True:
            try:
                with open(self._FIFO_device2aiot, 'r') as fifoIn:
                    for line in fifoIn:
                        # print(line)
                        responseJsonStr = line
                        responseDict = json.loads(responseJsonStr)
                        if responseDict['topic'] and self._deviceResponseHandlers[responseDict['topic']]:
                            self._deviceResponseHandlers[responseDict['topic']](responseDict)
                        else:
                            self._client.publishAsync('aiot/' + self._thingName + '/aiot_device/response', responseJsonStr, 1)
            except OSError as err:
                print("OS error: {0}".format(err))
            except:
                print("Unexpected error:", sys.exc_info()[0])



class CallbackContainer(object):

    def __init__(self, thingName, client):
        self._client = client
        self._thingName = thingName

    def messagePrint(self, client, userdata, message):
        print("Received a new message: ")
        print(message.payload)
        print("from topic: ")
        print(message.topic)
        print("--------------\n\n")

    def messageForward(self, client, userdata, message):
        topicRepublish = message.topic + "/republish"
        print("Forwarding message from: %s to %s" % (message.topic, topicRepublish))
        print("--------------\n\n")
        self._client.publishAsync(topicRepublish, str(message.payload), 1, self.pubackCallback)

    def pubackCallback(self, mid):
        # print("Received PUBACK packet id: ")
        # print(mid)
        # print("++++++++++++++\n\n")
        pass

    def subackCallback(self, mid, data):
        # print("Received SUBACK packet id: ")
        # print(mid)
        # print("Granted QoS: ")
        # print(data)
        # print("++++++++++++++\n\n")
        pass

class JobsMessageProcessor(object):
    def __init__(self, awsIoTMQTTThingJobsClient, clientToken):
        #keep track of this to correlate request/responses
        self.clientToken = clientToken
        self.awsIoTMQTTThingJobsClient = awsIoTMQTTThingJobsClient
        self.done = False
        self.jobsStarted = 0
        self.jobsSucceeded = 0
        self.jobsRejected = 0
        self._setupCallbacks(self.awsIoTMQTTThingJobsClient)

    def _setupCallbacks(self, awsIoTMQTTThingJobsClient):
        self.awsIoTMQTTThingJobsClient.createJobSubscription(self.newJobReceived, jobExecutionTopicType.JOB_NOTIFY_NEXT_TOPIC)
        self.awsIoTMQTTThingJobsClient.createJobSubscription(self.startNextJobSuccessfullyInProgress, jobExecutionTopicType.JOB_START_NEXT_TOPIC, jobExecutionTopicReplyType.JOB_ACCEPTED_REPLY_TYPE)
        self.awsIoTMQTTThingJobsClient.createJobSubscription(self.startNextRejected, jobExecutionTopicType.JOB_START_NEXT_TOPIC, jobExecutionTopicReplyType.JOB_REJECTED_REPLY_TYPE)

        # '+' indicates a wildcard for jobId in the following subscriptions
        self.awsIoTMQTTThingJobsClient.createJobSubscription(self.updateJobSuccessful, jobExecutionTopicType.JOB_UPDATE_TOPIC, jobExecutionTopicReplyType.JOB_ACCEPTED_REPLY_TYPE, '+')
        self.awsIoTMQTTThingJobsClient.createJobSubscription(self.updateJobRejected, jobExecutionTopicType.JOB_UPDATE_TOPIC, jobExecutionTopicReplyType.JOB_REJECTED_REPLY_TYPE, '+')

    #call back on successful job updates
    def startNextJobSuccessfullyInProgress(self, client, userdata, message):
        payload = json.loads(message.payload.decode('utf-8'))
        if 'execution' in payload:
            self.jobsStarted += 1
            execution = payload['execution']
            self.executeJob(execution)
            statusDetails = {'HandledBy': 'ClientToken: {}'.format(self.clientToken)}
            threading.Thread(target = self.awsIoTMQTTThingJobsClient.sendJobsUpdate, kwargs = {'jobId': execution['jobId'], 'status': jobExecutionStatus.JOB_EXECUTION_SUCCEEDED, 'statusDetails': statusDetails, 'expectedVersion': execution['versionNumber'], 'executionNumber': execution['executionNumber']}).start()
        else:
            print('Start next saw no execution: ' + message.payload.decode('utf-8'))
            self.done = True

    def executeJob(self, execution):
        print('Executing job ID, version, number: {}, {}, {}'.format(execution['jobId'], execution['versionNumber'], execution['executionNumber']))
        print('With jobDocument: ' + json.dumps(execution['jobDocument']))

    def newJobReceived(self, client, userdata, message):
        payload = json.loads(message.payload.decode('utf-8'))
        if 'execution' in payload:
            self._attemptStartNextJob()
        else:
            print('Notify next saw no execution')
            self.done = True

    def processJobs(self):
        self.done = False
        self._attemptStartNextJob()

    def startNextRejected(self, client, userdata, message):
        printf('Start next rejected:' + message.payload.decode('utf-8'))
        self.jobsRejected += 1

    def updateJobSuccessful(self, client, userdata, message):
        self.jobsSucceeded += 1

    def updateJobRejected(self, client, userdata, message):
        self.jobsRejected += 1

    def _attemptStartNextJob(self):
        statusDetails = {'StartedBy': 'ClientToken: {} on {}'.format(self.clientToken, datetime.datetime.now().isoformat())}
        threading.Thread(target=self.awsIoTMQTTThingJobsClient.sendJobsStartNext, kwargs = {'statusDetails': statusDetails}).start()

    def isDone(self):
        return self.done

    def getStats(self):
        stats = {}
        stats['jobsStarted'] = self.jobsStarted
        stats['jobsSucceeded'] = self.jobsSucceeded
        stats['jobsRejected'] = self.jobsRejected
        return stats

class TimerThread(threading.Thread):  # Inherit Thread class
    def __init__(self, event, interval, handler):
        threading.Thread.__init__(self)
        self.stopped = event    # assign the event to the 'stopped' named flag
        self.handler = handler
        self.interval = interval
    def run(self):
        self.handler()  # run immediately first time, then wait
        print('waiting...')
        while not self.stopped.wait(self.interval):   # wait(timeout): Block until the internal flag is true.
            # call a function
            self.handler()
            # wait
            print('waiting...')

def readSensorEvents():
    print("read sensor events")
    topic = 'aiot/' + thingName + '/aiot_iotdata/put'
    messageBody = ''
    # https://docs.python.org/3/library/os.path.html#os.pat
    # eventPath = "/Users/denniskung/Development/sbc700/aws-iot-device-sdk-python-master/samples/basicPubSub"
    eventPath = "/tmp/IoT"
    eventFiles = [f for f in os.listdir(eventPath) if os.path.isfile(os.path.join(eventPath, f))]
    for fileName in eventFiles:
        eventFileName = os.path.join(eventPath, fileName)
        # all files in the dir
        timeStamp = str(long(os.path.getmtime(eventFileName)*1000)) # x1000 to miliseconds
        # print('timestamp: ' + timeStamp)
        eventFile = open(eventFileName, "r")
        fileData = eventFile.read()
        eventFile.close()
        os.remove(eventFileName)
        # append file data to a buffer
        if messageBody == '':
            messageBody = '{"data": [{"TimeStamp":' + timeStamp + ' "data": ' + fileData + '}'
        else:
        	messageBody = messageBody + ', {"TimeStamp": ' + timeStamp + ' "data": ' + fileData + '}'
        if len(messageBody) > 1000:
            messageBody = messageBody + "]}"
            # publish the buffer as message
            # print('publishing..')
            myAWSIoTMQTTClient.publishAsync(topic, messageBody, 1)
                # https://s3.amazonaws.com/aws-iot-device-sdk-python-docs/html/index.html
            # reset buffer
            # print(messageBody)
            messageBody = ''
    if len(messageBody) > 0:
        messageBody = messageBody + "]}"
        # publish the buffer as message
        myAWSIoTMQTTClient.publishAsync(topic, messageBody, 1)
        # reset buffer
        # print(messageBody)
        messageBody = ''

# Read in command-line parameters
parser = argparse.ArgumentParser()
parser.add_argument("-f", "--configFile", action="store", dest="configFile", help="Your config file")
parser.add_argument("-n", "--thingName", action="store", dest="thingName", help="Your AWS IoT ThingName to process jobs for")
parser.add_argument("-e", "--endpoint", action="store", required=True, dest="host", help="Your AWS IoT custom endpoint")
parser.add_argument("-r", "--rootCA", action="store", required=True, dest="rootCAPath", help="Root CA file path")
parser.add_argument("-c", "--cert", action="store", dest="certificatePath", help="Certificate file path")
parser.add_argument("-k", "--key", action="store", dest="privateKeyPath", help="Private key file path")
parser.add_argument("-p", "--port", action="store", dest="port", type=int, help="Port number override")
parser.add_argument("-w", "--websocket", action="store_true", dest="useWebsocket", default=False,
                    help="Use MQTT over WebSocket")
parser.add_argument("-id", "--clientId", action="store", dest="clientId", default="basicPubSub",
                    help="Targeted client id")
# parser.add_argument("-t", "--topic", action="store", dest="topic", default="sdk/test/Python", help="Targeted topic")

args = parser.parse_args()
host = args.host
configFile = args.configFile
rootCAPath = args.rootCAPath
certificatePath = args.certificatePath
privateKeyPath = args.privateKeyPath
port = args.port
useWebsocket = args.useWebsocket
clientId = args.clientId
thingName = args.thingName
confgFile = args.configFile
# topic = args.topic

print('thing:' + thingName)
if args.configFile:
    configFileData = ''
    with open(configFile, "r") as configFileObject:
        configFileData = configFileObject.read()
        configFileObject.close()
    configDict = json.loads(configFileData)
    thingName = configDict['thingName']
    print('thing:' + thingName +':end')
    rootCAPath = configDict['rootCAPath']
    certificatePath = configDict['certificatePath']
    privateKeyPath = configDict['privateKeyPath']


if args.useWebsocket and args.certificatePath and args.privateKeyPath:
    parser.error("X.509 cert authentication and WebSocket are mutual exclusive. Please pick one.")
    exit(2)

if not args.useWebsocket and (not args.certificatePath or not args.privateKeyPath):
    parser.error("Missing credentials for authentication.")
    exit(2)

# Port defaults
if args.useWebsocket and not args.port:  # When no port override for WebSocket, default to 443
    port = 443
if not args.useWebsocket and not args.port:  # When no port override for non-WebSocket, default to 8883
    port = 8883

# Configure logging
logger = logging.getLogger("AWSIoTPythonSDK.core")
logger.setLevel(logging.DEBUG)
streamHandler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
streamHandler.setFormatter(formatter)
logger.addHandler(streamHandler)

# Init AWSIoTMQTTClient
myAWSIoTMQTTClient = None
if useWebsocket:
    myAWSIoTMQTTClient = AWSIoTMQTTClient(clientId, useWebsocket=True)
    myAWSIoTMQTTClient.configureEndpoint(host, port)
    myAWSIoTMQTTClient.configureCredentials(rootCAPath)
else:
    myAWSIoTMQTTClient = AWSIoTMQTTClient(clientId)
    myAWSIoTMQTTClient.configureEndpoint(host, port)
    myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# Connect and subscribe to AWS IoT
myAWSIoTMQTTClient.connect()

# Perform synchronous subscribes
# -- myAWSIoTMQTTClient.subscribe(topic, 1, myCallbackContainer.messageForward)
# -- myAWSIoTMQTTClient.subscribe(topic + "/republish", 1, myCallbackContainer.messagePrint)
# -- time.sleep(2)

# start timer for periodic check available IoT data
threadStopFlag = threading.Event() 
    # Event(): A factory function that returns a new event object.
    # An event manages a flag that can be set to true with the set() method and 
    # reset to false with the clear() method. 
    # The wait() method blocks until the flag is true.

if thingName == '' or thingName == ' ':
    pass
        # if the stopFlag is set to true, then exit the thread
        # invoke to publish sensor event
else:
    thread = TimerThread(threadStopFlag, 30, readSensorEvents)
        # if the stopFlag is set to true, then exit the thread
        # invoke to publish sensor event
thread.start()
    # Start the thread's activity.
    # It must be called at most once per thread object. 
    # It arranges for the object's run() method to be invoked in a separate thread of control.

# thread to 1) receive requests from cloud, 
# 2) request device daemon to resolve and 3) forward daemon's response to cloud.
deviceThread = DeviceThread(thingName, myAWSIoTMQTTClient)
deviceThread.start()

# TODO currently it needs periodic publish to cloud to maintain connections, otherwise
# connections will disconnect after around 10 minutes by system,
# some issues from keepalive ? needs to be verified later. 2020/1/31
# as SBC700 is releasing IoT data every minutes, gurantees the periodic publishing for now.

# Wait forever
while True:
    time.sleep(10)
# this will stop the timer
threadStopFlag.set() # exit the thread
