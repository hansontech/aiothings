const aiot = require('aiothings');

// process.env.INPUT_MESSAGE_TOPIC
// process.env.OUTPUT_MESSAGE_TOPIC
// event.sender

exports.handler = async (event, context) => {
    // Add your code here
	await aiot.messagePublish(event, {data: 'payload'});
};