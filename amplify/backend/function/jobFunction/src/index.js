/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const aws = require('aws-sdk')

var config = {
    thingTableName: "atThingTable",
    deviceTableName: 'atDeviceTable',
    aiotS3bucketName: "aiot-bucket" + '-' + process.env.ENV
};

exports.handler = async (event) => {
    // TODO implement
    const dynamodb = new aws.DynamoDB.DocumentClient()
    const s3 = new aws.S3()
    const iot = new aws.Iot()
    if (event.eventType === 'JOB' && event.status === 'COMPLETED') {
        let jobId = event.jobId
        let jobDetail = jobId.split('_')
        if (jobDetail[0] === 'fw') {
           try {
            let jobDocumentData = await iot.getJobDocument({
                jobId: jobId
            }).promise()
            let jobDocument = JSON.parse(jobDocumentData.document)
            if (jobDetail[1] === 'thing') {
                // update thing table
                let userId = jobDocument.userId
                let iotcert = jobDocument.certId
                let thingData = await dynamodb.get({
                    TableName: config.thingTableName,
                    Key: {
                        'UserId': userId,
                        'CertId': iotcert
                    }
                }).promise()
                let thing = thingData.Item
                if (thing.Firmware.Processing !== undefined) {
                    thing.Firmware = thing.Firmware.Processing
                }
                await dynamodb.update({
                    TableName: config.thingTableName,
                    Key:{
                        'UserId': userId,
                        'CertId': iotcert
                    },
                    UpdateExpression: 'set Firmware = :firmware',
                    ExpressionAttributeValues:{
                        ':firmware': thing.Firmware
                    },
                    ReturnValues:'UPDATED_NEW'
                }).promise()
            } else if (jobDetail[1] === 'group') {
                // update device table
                let deviceGroupName = jobDocument.target
                let deviceData = await dynamodb.get({
                    TableName: config.deviceTableName,
                    Key: {
                        'DeviceGroupName': deviceGroupName,
                        'DeviceId': ' '
                    }
                }).promise()
                let deviceGroup = deviceData.Item
                if (deviceGroup.Firmware.Processing !== undefined) {
                    deviceGroup.Firmware = deviceGroup.Firmware.Processing
                }           
                await dynamodb.update({
                    TableName: config.deviceTableName,
                    Key:{
                        'DeviceGroupName': deviceGroupName,
                        'DeviceId': ' '
                    },
                    UpdateExpression: 'set Firmware = :firmware',
                    ExpressionAttributeValues:{
                        ':firmware': deviceGroup.Firmware
                    },
                    ReturnValues:'UPDATED_NEW'
                }).promise()
            }
            if (jobDocument.files !== undefined) {
                for (let file of jobDocument.files) {
                    await s3.deleteObject({
                        Bucket: config.aiotS3bucketName,
                        Key: "public/" + file.bucketKey
                    }).promise()
                }
            }
            await iot.deleteJob({
                jobId: jobId,
                force: true
            }).promise().catch( function(error) {
                console.log('deleteJob error: ', error)
            })
          } catch(err) {
            console.log('job completion error: ', err)
          }
        }
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify('job completed'),
    };
    return response;
};
