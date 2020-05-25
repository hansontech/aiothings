import os
import threading
import sys

def reportDeviceStatus():
    return {"sensor1": true, "sensor2": false, "sensor3": "off"}

def deviceResponse(topic, payload):
    message = { 'topic': topic, 'payload': payload }
    FIFO_device2aiot = '/tmp/pipe_device2aiot'
    try:
        os.mkfifo(FIFO_device2aiot)
    except OSError:
        pass    # if failed to make, just ignore this action
    try:
        with open(FIFO_device2aiot, 'w') as fifoOut:
            fifoOut.write(json.dumps(message)
            fifoOut.close()
    except OSError as err:
        print("OS error: {0}".format(err))
    except:
        print("Unexpected error:", sys.exc_info()[0])

FIFO_aiot2device = '/tmp/pipe_aiot2device'

try:
    os.mkfifo(FIFO_aiot2device)
except OSError as e:
    pass

while True:
    try:
        with open(FIFO_aiot2device) as fifoIn:
            for line in fifoIn:
                print(line)
                messageJsonStr = line
                messageDict = json.loads(messageJsonStr)
                messageTopic = messageDict['topic']
                if messageTopic == 'device_id/request':
                    # TODO get the device id
                    payload = {
                        'deviceGroup': 'SBC700_group',
                        'deviceId' : '343435'
                    }
                    topic = 'device_id/response'
                else if messageTopic == 'device_status/request'
                    payload = reportDeviceStatus()
                    topic = 'device_status/response'
                threading.Thread(target=deviceResponse, kwargs={'topic': topic, 'payload': payload}).start()
    except OSError as err:
        print("OS error: {0}".format(err))
    except:
        print("Unexpected error:", sys.exc_info()[0])
