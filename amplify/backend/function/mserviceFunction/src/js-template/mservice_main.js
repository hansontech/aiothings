let aiot = null
const userMain = require('./__main__');

// process.env.INPUT_MESSAGE_TOPIC
// process.env.OUTPUT_MESSAGE_TOPIC
// event.sender

exports.handler = (event, context, callback) => {
    if (process.env.hasOwnProperty('AIOT_RUN_FROM_EDGE') && process.env.AIOT_RUN_FROM_EDGE === 'true') {
        // do nothing
    } else {
        aiot = require('./aiothings');
        if (process.env.INPUT_MESSAGE_TOPIC === 'null' && process.env.OUTPUT_MESSAGE_TOPIC === 'null') {
            // do nothing
        } else {
            aiot.setInput(event);
        }
    }
    // Add your code here
    // aiot.consoleOutput('main:' + process.env.MSERVICE_NAME); // display from console
    userMain.__handler__(event, context, callback)
};