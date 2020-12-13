import aiothings as aiot
import os

# os.environ['INPUT_MESSAGE_TOPIC']
# os.environ['OUTPUT_MESSAGE_TOPIC']
# event['sender']

def handler(event, context):
    # TODO implement
    aiot.consoleOutput('Console display:' + os.environ['MSERVICE_NAME']) # Output to console
    aiot.messagePublish({'data': event['data']}) # Must be a JSON, forward data as output message