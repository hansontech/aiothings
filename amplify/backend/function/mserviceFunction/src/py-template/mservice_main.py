import __main__ as userMain
import os

# os.environ['INPUT_MESSAGE_TOPIC']
# os.environ['OUTPUT_MESSAGE_TOPIC']
# event['sender']

def handler(event, context):
    if ('AIOT_RUN_FROM_EDGE' in os.environ) and (os.environ['AIOT_RUN_FROM_EDGE'] == 'true'):
        # do nothing
        pass
    else:
        import aiothings as aiot
        if (os.environ['INPUT_MESSAGE_TOPIC'] == 'null') and (os.environ['OUTPUT_MESSAGE_TOPIC'] == 'null'):
            # do nothing
            pass
        else:
            aiot.setInput(event)
    # aiot.consoleOutput('Console display')   # Output to console
    return userMain.__handler__(event, context)