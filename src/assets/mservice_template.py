import aiothings as aiot

# os.environ['INPUT_MESSAGE_TOPIC']
# os.environ['OUTPUT_MESSAGE_TOPIC']
# event['sender']

def handler(event, context):
    # TODO implement
    aiot.messagePublish(event, {'data': 'payload'})