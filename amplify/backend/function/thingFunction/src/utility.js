var https = require('https');
const config = require('./config');
// Load the SDK for JavaScript
const AWS = require('aws-sdk');
// Set the region 
console.log(config.DynamoDB_TABLE_NAME);
AWS.config.update({region: `${config.DYNAMODB_TABLE_REGION}`});
// Set the Dynamodb Table
const Device_TABLE_NAME = config.DynamoDB_TABLE_NAME;

// The DocumentClient class allows us to interact with DynamoDB using normal objects.
const dynamoDb = new AWS.DynamoDB.DocumentClient();
// AWS DynamoDB API reference
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html

// Search User identity information from Dynamodb
let findDataBySerialNumber = ( values,callback ) => {

      dynamoDb.query({
        TableName: Device_TABLE_NAME,
        KeyConditionExpression: 'serialNumber = :a',
        ExpressionAttributeValues: {
            ':a': values
        }
      }, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            message: 'Could not load your device info',
          }).end();
          callback( err );
        } else {
          //console.log(data.Count);
          callback( null, data );
        }
      });
}

let deleteAlert = async (thingId) => {
  let iot = new AWS.Iot();
  let iotTopicRuleName = thingId.replace(/\-/g, '_') + '_alert_rule';
  try {
    await iot.deleteTopicRule({
      ruleName: iotTopicRuleName, /* required */
    }).promise()
  } catch (err) {
    console.log('deleteTopicRule warn: ', err);
  }
}
let setAlert = async (userId, thingId, isEnableAlert) => {
  console.log('enableAlert');
  let lambda = new AWS.Lambda();
  let iot = new AWS.Iot();
  let iotTopicRuleName = thingId.replace(/\-/g, '_') + '_alert_rule';
  let functionName = config.alertFunctionName
  try {
    if (isEnableAlert) {
      let functionData = await lambda.getFunction({
        FunctionName: functionName
      }).promise()
      let addPermissionPromise = lambda.addPermission({
        Action: "lambda:InvokeFunction", 
        FunctionName: functionName,
        Principal: "iot.amazonaws.com", 
        StatementId: functionName + "_perm_invoke"
      }).promise()
      await addPermissionPromise.catch( function (err) { 
        console.log('addPermission: warning: ', err); // an error occurred
      });
      let theFunctionArn = functionData.Configuration.FunctionArn;
      let getTopicRulePromise = iot.getTopicRule({
        ruleName: iotTopicRuleName /* required */
      }).promise()
      let ruleData = null
      ruleData = await getTopicRulePromise.catch (async function (err) {
        console.log('createTopicRule: ');
        ruleData = await iot.createTopicRule({
          ruleName: iotTopicRuleName, /* required */
          topicRulePayload: { /* required */
            actions: [ /* required */
              {
                lambda: {
                  functionArn: theFunctionArn /* required */
                }
              }
            ],
            sql: "SELECT *, topic() AS topic, topic(2) AS sender, topic(3) AS fromWhere FROM '" + "aiot/" + userId + "/" + thingId + "/aiot_event/+'", /* required */
            // , topic() AS MessageTopic
            ruleDisabled: false,
            awsIotSqlVersion: '2016-03-23'
          }
        }).promise()
      })
      console.log('iot rule created or already exist: ', ruleData)
      await iot.enableTopicRule({
        ruleName: iotTopicRuleName /* required */
      }).promise()
    } else {
      await iot.disableTopicRule({
        ruleName: iotTopicRuleName /* required */
      }).promise()
    }
    /*
         console.log('replaceTopicRule: ', iotTopicRuleParams);
         iot.replaceTopicRule(iotTopicRuleParams, function(err, data) {
           if (err) console.log(err); // an error occurred
           else{
             gulp.task('version-update-return')();     
           }
         });  
    */
  } catch (err) {
    console.log('setAlert warn: ', err)
  }
}

// Put IoT cert info into Dynamodb
let dbInsertCertinfo = ( userId, certId, thingId, thingNameTag, desc, publicKey, privateKey, alertEnabled, callback ) => {
  let itemList =  {
    'UserId': userId,
    'CertId': certId,
    'ThingId': thingId,
    'ThingName': thingNameTag,
    'ThingDesc': desc,
    'PrivateKey': privateKey,
    'PublicKey': publicKey,
    'AlertEnabled': alertEnabled
  };
  var params = {
    TableName: Device_TABLE_NAME,
    Item: itemList
  };
  // console.log('db item: ', itemList)
  dynamoDb.put(params, async function(err, data) {
    if (err) {
      console.log(err);
      callback( err );
    } else {
      await setAlert(userId, thingId, alertEnabled)
      callback( null, itemList );
    }
  });
}

// Put IoT cert info into Dynamodb
let dbUpdateCertinfo = ( userId, iotcert, thingNameTag, thingId, desc, alertEnabled, callback ) => {
   
  dynamoDb.update({
    TableName: Device_TABLE_NAME,
    Key:{
        'UserId': userId,
        'CertId': iotcert
    },
    UpdateExpression: 'set ThingDesc = :desc, ThingName = :name, AlertEnabled = :alertEnabled',
    ExpressionAttributeValues:{
        ':desc': desc,
        ':name': thingNameTag,
        ':alertEnabled': alertEnabled
    },
    ReturnValues:'UPDATED_NEW'
  }, async (err, data) => {
    if (err) {
      console.log(err);
      callback( err );
    } else {
      await setAlert(userId, thingId, alertEnabled)
      callback( null, data );
    }
  });
}
let dbUpdateEdgeAsync = async (userId, iotcert, edgeData) => {
  try {
    await dynamoDb.update({
      TableName: Device_TABLE_NAME,
      Key:{
          'UserId': userId,
          'CertId': iotcert
      },
      UpdateExpression: 'set EdgeData = :edgeData',
      ExpressionAttributeValues:{
          ':edgeData': edgeData
      },
      ReturnValues:'UPDATED_NEW'
    }).promise()
  } catch(err) {
    console.log('dbUpdateEdgeAsync error: ', err)
  }
}

let dbUpdateEdge = ( userId, iotcert, edgeData, callback ) => {
 
  dynamoDb.update({
    TableName: Device_TABLE_NAME,
    Key:{
        'UserId': userId,
        'CertId': iotcert
    },
    UpdateExpression: 'set EdgeData = :edgeData',
    ExpressionAttributeValues:{
        ':edgeData': edgeData
    },
    ReturnValues:'UPDATED_NEW'
  }, (err, data) => {
    if (err) {
      console.log(err);
      callback( err );
    } else {
      callback( null, data );
    }
  });
}

let dbDeleteEdge = async ( userId, iotcert) => {
  try {
    await dynamoDb.update({
        TableName: Device_TABLE_NAME,
        Key:{
            'UserId': userId,
            'CertId': iotcert
        },
        UpdateExpression: 'REMOVE EdgeData',
        ReturnValues:'UPDATED_NEW'
    }).promise()
  } catch (err) {
    console.log('dbDeleteEdge error: ', err);
  }
}

// Remove IoT cert of the user from Dynamodb
let dbDeleteCertinfo = ( userId, thingId, iotcert, callback ) => {
 
  var params = {
    TableName: Device_TABLE_NAME,
    Key: {
      'UserId': userId,
      'CertId': iotcert
    }
  };
  dynamoDb.delete(params, async function(err, data) {
    if (err) {
      console.log('dynamoDb delete: error: ', err);
      callback( err );
    } else {
      await deleteAlert(thingId)
      callback( null,data );
    }
  });

}

// List all IoT cert info of the user from Dynamodb
let dbListCertinfo = ( userId, callback ) => {
  // ProjectionExpression:'UserId, CertId, ThingId, ThingName, ThingDesc',
  var params = {
    TableName: Device_TABLE_NAME,
    KeyConditionExpression: '#userid = :userid',
    FilterExpression: 'IsDeviceGroup <> :isDeviceGroup',
    ExpressionAttributeNames:{
        '#userid': 'UserId'
    },
    ExpressionAttributeValues: {
        ':userid': userId,
        ':isDeviceGroup': true
    },
    ProjectionExpression: "ThingName, ThingDesc, ThingId, CertId, UserId, EdgeData, ThingTimeZone, AlertEnabled"
  };

  dynamoDb.query(params, function(err, data) {
    if (err) {
        console.log('Unable to query. Error: ', JSON.stringify(err, null, 2));
    } else {
        console.log('Query succeeded.');
        let dataJson = JSON.stringify(data.Items)
        callback( null, dataJson );
    }
  });  
}

// Get IoT cert info from Dynamodb
let dbGetCertinfo = async ( userId, iotcert, callback ) => {
  let params = {
    TableName: Device_TABLE_NAME,
    KeyConditionExpression: '#userid = :userid and #certid = :certid',
    // Projection of all fields as output
    ExpressionAttributeNames:{
        '#userid': 'UserId',
        '#certid': 'CertId'
    },
    ExpressionAttributeValues: {
        ':userid': userId,
        ':certid': iotcert
    }
  };

  dynamoDb.query(params, function(err, data) {
    if (err) {
        console.log('getCertinfo: Unable to query. Error:', JSON.stringify(err, null, 2));
        callback(err)
    } else {
        console.log('getCertinfo: Query succeeded.');
        let dataJson = data.Items[0]
        callback( null, dataJson );
    }
  });  
}

let dbGetCertinfoAsync = async (userId, iotcert) => {
  var params = {
    TableName: Device_TABLE_NAME,
    KeyConditionExpression: '#userid = :userid and #certid = :certid',
    // Projection of all fields as output
    ExpressionAttributeNames:{
        '#userid': 'UserId',
        '#certid': 'CertId'
    },
    ExpressionAttributeValues: {
        ':userid': userId,
        ':certid': iotcert
    }
  };

  try {
    let data = await dynamoDb.query(params).promise()
    return data.Items
  } catch (err) {
    console.log('getCertinfo: Unable to query. Error:', JSON.stringify(err, null, 2));
    throw err
  } 
}
// AWS IOT reference
// Language examples
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html
// Detail AWS IOT API information
// https://docs.aws.amazon.com/iot/latest/apireference/Welcome.html

// Learn how to set IoT Policy
// https://docs.aws.amazon.com/iot/latest/developerguide/pub-sub-policy.html
// https://aws.timwang.space/blog/?p=295

let iotPolicyTemplate = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [ "greengrass:*" ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:UpdateThingShadow",
        "iot:GetThingShadow",
        "iot:DeleteThingShadow",
        "iot:Connect",
        "iot:Subscribe",
        "iot:DescribeJobExecution",
        "iot:GetPendingJobExecutions",
        "iot:UpdateJobExecution",
        "iot:StartNextPendingJobExecution"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
          "iot:Publish",
          "iot:Receive"
      ],
      "Resource": [
        "arn:aws:iot:REGION_NAME:ACCOUNT_ID:topic/aiot/USER_ID/*",
        "arn:aws:iot:REGION_NAME:ACCOUNT_ID:topic/aiot/THING_ID/*",
        "arn:aws:iot:REGION_NAME:ACCOUNT_ID:topic/$aws/*"   
      ]
    }
  ]
}

let iotProvisioningPolicyTemplate = {
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": ["iot:Connect"],
          "Resource": "*"
      },
      {
          "Effect": "Allow",
          "Action": ["iot:Publish","iot:Receive"],
          "Resource": [
              "arn:aws:iot:REGION_NAME:ACCOUNT_ID:topic/aiot/system/*/certificates/*"
          ]
      },
      {
          "Effect": "Allow",
          "Action": "iot:Subscribe",
          "Resource": [
              "arn:aws:iot:REGION_NAME:ACCOUNT_ID:topicfilter/aiot/system/+/certificates/*"
          ]
      }
  ]
}

let applyDeviceGroupCert = ( userId, deviceGroupName, callback) => {
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  var params = {
    setAsActive: true
  };
  // Create cert
  iot.createKeysAndCertificate(params, async function(err, certData) {
    // console.log(certData);
    if (err){
      console.log(err, err.stack); // an error occurred
      callback(err)
      return
    } 
    // else{
    try {
      // let datetime = (new Date()).getTime()
      // console.log('applyThingCert: certData: ', certData)
      //let thingId = userId + '_' + datetime
      let thingId = userId + '_device_group_' + deviceGroupName // 2020/01 
      let policyName = userId + '_device_group_' + deviceGroupName
      // Create IoT Policy for asbove cert
      let sts = new AWS.STS()
      let stsData = await sts.getCallerIdentity({}).promise()
      let accountId = stsData.Account
      iotPolicyTemplateStr = JSON.stringify(iotProvisioningPolicyTemplate)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/ACCOUNT_ID/g, accountId)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/REGION_NAME/g, config.region)
      let iotPolicy = JSON.parse(iotPolicyTemplateStr)
      // console.log('iotPolicy: ', iotPolicy)
      await iot.createPolicy({
        policyDocument: iotPolicyTemplateStr, /* required */
        policyName: policyName /* required */
      }).promise().catch(function(err) {
        console.log('warning: ', err); // an error occurred
      })
      await iot.attachPolicy( {
        policyName: policyName, /* required */
        target: certData.certificateArn /* required */
      }).promise()
      await iot.createThing( {
        thingName: thingId, /* required */
        attributePayload: {
          attributes: {
            'Application': 'AIOT',
            'UserId': userId,
            'DeviceGroupName': deviceGroupName                
          },
          merge: true || false
        }
      }).promise().catch(function(err) {
        console.log('warning: ', err); // an error occurred
      })
      let certArn = certData.certificateArn
      let certId = certData.certificateId
      // Attach thing for cert
      await iot.attachThingPrincipal({
        principal: certArn, /* required */
        thingName: thingId /* required */
      }).promise()
      callback( null, certId, thingId, certData);
    } catch (err) {
      // console.log('createKeysAndCertificate: ', err)
      callback(err)
    }              
  });  
}
let getDeviceGroup = async ( deviceGroupName ) => {
  try {
    partitionKeyName = 'DeviceGroupName'
    sortKeyName = 'DeviceId'
    params[partitionKeyName] = deviceGroupName
    params[sortKeyName] = ' ' // empty space means the root entry of the device group
    data = await dynamodb.get({
        TableName: config.deviceTableName,
        Key: params
    }).promise()
    if (typeof data.Item === 'undefined'){
        return null
    }
    let deviceGroup = data.Item
    return deviceGroup
  } catch (err) {
    console.log('get device group error: ', err)
    return null
  }
}
// Apply cert & Attach thing, policy
let applyThingCert = ( userId, thingNameTag, deviceGroupName, callback ) => {
  console.log('applyCert region: ', config.region)  
  console.log('userId: ', userId)  
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  var params = {
    setAsActive: true
  };
  // Create cert
  iot.createKeysAndCertificate(params, async function(err, certData) {
    // console.log(certData);
    if (err){
      console.log(err, err.stack); // an error occurred
      callback(err)
      return
    } 
    // else{
    try {
      let deviceGroup = null
      if (deviceGroupName !== '') {
        deviceGroup = await getDeviceGroup(deviceGroupName)
      }
      // let datetime = (new Date()).getTime()
      // console.log('applyThingCert: certData: ', certData)
      //let thingId = userId + '_' + datetime
      let thingId = userId + '_' + thingNameTag // 2020/01 
      let policyName = userId + '_' + thingNameTag
      // Create IoT Policy for asbove cert
      let sts = new AWS.STS()
      let stsData = await sts.getCallerIdentity({}).promise()
      let accountId = stsData.Account
      iotPolicyTemplateStr = JSON.stringify(iotPolicyTemplate)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/ACCOUNT_ID/g, accountId)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/REGION_NAME/g, config.region)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/USER_ID/g, userId)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/THING_ID/g, thingId)
      let iotPolicy = JSON.parse(iotPolicyTemplateStr)
      console.log('iotPolicy: ', iotPolicy)
      await iot.createPolicy({
        policyDocument: iotPolicyTemplateStr, /* required */
        policyName: policyName /* required */
      }).promise()
      await iot.attachPolicy( {
        policyName: policyName, /* required */
        target: certData.certificateArn /* required */
      }).promise()
      let thingAttributes =  {
        'UserId': userId                  
      }
      if (deviceGroup !== null) {
        thingAttributes.DeviceGroupOwner = deviceGroup.OwnerId
        thingAttributes.DeviceGroupName = deviceGroupName
      }
      await iot.createThing( {
        thingName: thingId, /* required */
        attributePayload: {
          attributes: thingAttributes,
          merge: true
        }
      }).promise()
      let certArn = certData.certificateArn
      let certId = certData.certificateId
      // Attach thing for cert
      await iot.attachThingPrincipal({
        principal: certArn, /* required */
        thingName: thingId /* required */
      }).promise()
      // republish to transform aiot/thingId topic to aiot/userId/thingNameTag
      let republishTopic = 'aiot/' + userId + '/' + thingId + '${substring(topic(),' + ('aiot/' + thingId).length + ')}'
      // console.log('republish topic: ', republishTopic)
      await iot.createTopicRule({
        ruleName: thingId.replace(/\-/g, '_') + '_t2ut', /* required */
        topicRulePayload: { /* required */
          actions: [ /* required */
            {
              republish: {
                roleArn: config.aiotIotActionRole, /* required */
                topic: republishTopic /* required */
                // qos: 1 // TODO, cause error Unexpected key - 
              }
            }
          ],
          sql: "SELECT * FROM 'aiot/" +  thingId + "/#'" , /* required */
          // , topic() AS MessageTopic
          ruleDisabled: false,
          awsIotSqlVersion: '2016-03-23'
        }
      }).promise()
      callback( null, certId, thingId, certData);
    } catch (err) {
      console.log('createKeysAndCertificate: ', err)
      callback(err)
    }              
  });
}

// Apply cert & Attach thing, policy
let updateThingCert = ( userId, certId, thingId, thingNameTag, callback ) => {
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  // get cert
  iot.describeCertificate({
    certificateId: certId
  }, async function (err, certData) {
      if (err){
      console.log(err, err.stack); // an error occurred
      callback(err)
      return
    }
    try {
      let policyName = userId + '_' + thingNameTag
      await iot.detachPolicy({
        policyName: policyName,
        target: certData.certificateDescription.certificateArn
      }).promise().catch( function(error) {
        console.log('detachPolicy: ', error)
      })
      let listPolicyData = await iot.listPolicyVersions({policyName: policyName}).promise()
      for (let policyVersion of listPolicyData.policyVersions) {
        if (policyVersion.isDefaultVersion) {
        } else {
          console.log('policyVersion: ', policyVersion)
          await iot.deletePolicyVersion( {
            policyName: policyName,
            policyVersionId: policyVersion.versionId
          }).promise().catch( function (error) {
            console.log('deletePolicyVersion: ', error)
          })
        }
      }
      console.log('deletePolicy')
      await iot.deletePolicy({
        policyName: policyName /* required */
      }).promise().catch( function(error) {
        console.log('deletePolicy: ', error)
      })
      // Create IoT Policy for above cert
      let sts = new AWS.STS()
      let stsData = await sts.getCallerIdentity({}).promise()
      let accountId = stsData.Account
      iotPolicyTemplateStr = JSON.stringify(iotPolicyTemplate)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/ACCOUNT_ID/g, accountId)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/REGION_NAME/g, config.region)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/USER_ID/g, userId)
      iotPolicyTemplateStr = iotPolicyTemplateStr.replace(/THING_ID/g, thingId)
      let iotPolicy = iotPolicyTemplateStr // JSON.parse(iotPolicyTemplateStr)
      console.log('iotPolicy: ', iotPolicy)
      await iot.createPolicy({
        policyDocument: iotPolicy, /* required */
        policyName: policyName /* required */
      }).promise()
      await iot.attachPolicy( {
        policyName: policyName, /* required */
        target: certData.certificateDescription.certificateArn /* required */
      }).promise()
      callback( null )
    } catch (err) {
      console.log('updateThingCert: ', err)
      callback(err)
    }              
  });
}
let allowUserIoT = (identityId, callback ) => {
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  // Create IoT Policy
  let policyName = `AiotPolicy.${identityId.split(':').join('-')}`;
  console.log('policyName: ', policyName)
  let getPolicyParams = {
    policyName: policyName /* required */
  };
  iot.getPolicy(getPolicyParams, function(err, data) {
    if (err) {
      console.log('getPolicy: err:', err); // an error occurred
      var createPolicyParams = {
        policyDocument: config.POLICY_DOCUMENT, /* required */
        policyName: policyName /* required */
      };
      iot.createPolicy(createPolicyParams, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
        } 
        // Attach policy for identity Id
        var params = {
            policyName: policyName, /* required */
            principal: identityId /* required */
        };
        iot.attachPrincipalPolicy(params, function(err, data) {        
          if (err) {
            console.log(err, err.stack); // an error occurred
          }
          callback(null)    
        });
      })  // create policy
    } else {
      console.log('getPolicy: success: ', data);           // successful response
      // DO NOTHING
      callback(null)
    }
  });
}


// remove a specific cert & thing, policy
let cancelThingCert = (certId, thingId, callback ) => {
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  var params = {
    setAsActive: true || false
  };
  // Lists the principals associated with the specified thing.
  let listPrincipalsThingParams = {
    thingName: thingId /* required */
  };
  iot.listThingPrincipals(listPrincipalsThingParams, function(err, principalsData) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    }
    else{
      console.log('listThingPricipals: principals: ', principalsData);           // successful response
      // Lists the policies attached to the specified thing group.
      let principal = principalsData.principals[0]
      let certArn = principal
      let listPoliciesParams = {
        target: certArn, /* required */
        // marker: 'STRING_VALUE',
        // pageSize: 1,
        // recursive: false
      };
      console.log('listPoliciesParams: ', listPoliciesParams)
      iot.listAttachedPolicies(listPoliciesParams, function(err, policyListData) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          // callback(err)
        }
        else{
          let policyList = policyListData.policies
          console.log('policyList: ', policyList);           // successful response
          // for all policies attached to this certificate
          for (policyIndex in policyList) {
            // Delete policy
            // JS reference https://www.w3schools.com/js/js_json_arrays.asp
            let policy = policyList[policyIndex]
            console.log('policy: ', policy);
            var detachParams = {
              policyName: policy.policyName, /* required */
              target: certArn /* required */
            };
            iot.detachPolicy(detachParams, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else{
                // console.log(data);           // successful response
                let deletePolicyParams = {
                  policyName: policy.policyName /* required */
                };
                console.log('deletePolicyParams: ', deletePolicyParams);
                iot.deletePolicy(deletePolicyParams, function(err, data) {
                  if (err){
                    console.log(err, err.stack); // an error occurred
                    // ... give up deleting, continue rest of tasks
                  } 
                  // else     console.log(data);           // successful response
                }); // delete policy
              } // if successfully detached policy
            });
          } // for each policy
        } // if successfully listed policies
        
        var updateCertParams = {
          certificateId: certId, /* required */
          newStatus: 'INACTIVE'
        };
        iot.updateCertificate(updateCertParams, function(err, data) {
            if (err) {
              console.log('updateCertificate: inactive: error: ', err)
              console.log(err, err.stack); // an error occurred
              callback(err)
            }
            else{
              console.log('updateCertificate: inactive: success')
              // console.log(data);           // successful response
              var detachParams = {
                principal: certArn, /* required */
                thingName: thingId /* required */
              };
              iot.detachThingPrincipal(detachParams, function(err, data) {
                if (err) {
                  console.log(err, err.stack); // an error occurred
                  callback(err)
                }
                else{
                  console.log('detachThingPrincipal: success')
                  // console.log(data);           // successful response
                  var deleteCertParams = {
                    certificateId: certId, /* required */
                    forceDelete: true
                  };
                  iot.deleteCertificate(deleteCertParams, function(err, data) {
                    if (err) {
                      console.log(err, err.stack); // an error occurred
                      callback(err)
                    }
                    else{
                      // console.log(data);           // successful response
                      console.log('deleteCertificate: success')
                      // Delete thing
                      let deleteThingParams = {
                        thingName: thingId, /* required */
                        // expectedVersion: 0
                      };
                      iot.deleteThing(deleteThingParams, async function(err, data) {
                        if (err) {
                          console.log(err, err.stack); // an error occurred
                          callback(err)
                        }
                        else{
                          iot.deleteTopicRule({
                            ruleName: thingId.replace(/\-/g, '_') + '_t2ut', /* required */
                          }).promise().catch(function(err) {
                            console.log(err)
                          })
                          // console.log(data);           // successful response
                          console.log('deleteThing: success')
                          callback( null );
                        }
                      }); // delete thing
                    } // if successfully deleted certificate  
                  }); // delete certificate
                } // if successfully detached thing from certificate
              }); // detach thing from certificate // delete certificate
            } // if successfully update certificate inactive
          }); // update certificate status to inactive

      }); // list policies of certificate
    } 
  }); // list certificate(s)
}

// Retrieve certificate details from an existing certificate id
let getCertPem = ( certId, callback ) => {
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  var params = {
    certificateId: certId /* required */
  };
  iot.describeCertificate(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      callback(err)
    } else {
      console.log('certId: ', certId, ': ', data);           // successful response
      console.log('certPem: ', data.certificateDescription.certificatePem);           // successful response
      callback(null, { 'CertPem' : data.certificateDescription.certificatePem } )
    }     
  });
}

let getThingDesc = ( thingName, certId, callback ) => {
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  var params = {
    thingName: thingName /* required */
  };
  iot.describeThing(params, function(err, thingData) {
    if (err) {
      console.log(err, err.stack) // an error occurred
      callback(err)
    } else {
      iot.describeCertificate({
        certificateId: certId /* required */
      }, function(err, certData) {
        if (err) callback(err) // an error occurred
        else{          // successful response
          callback(null, {thing: thingData, certificate: certData})
        }
      })
    }  
  });
}

// Get VeriSign Class 3 Public Primary G5 root CA certificate 
let getIoTRootCA = ( callback ) => {
  const RootCA_URL = config.RootCA_URL;
  https.get(RootCA_URL, ( response ) => {
    
    var body = [];
    //console.log(response.statusCode);
    //console.log(response.headers);
    //console.log(response);
    
    response.on('data', function (chunk) {
        body.push(chunk);
    });

    response.on('end', function () {
        body = Buffer.concat(body);
        //console.log(body.toString());
        callback( null, body.toString() );
    });
    
  })
}

module.exports = {
    findDataBySerialNumber,
    dbInsertCertinfo,
    dbUpdateCertinfo,
    dbListCertinfo,
    dbDeleteCertinfo,
    dbGetCertinfo,
    dbGetCertinfoAsync,
    dbUpdateEdge,
    dbUpdateEdgeAsync,
    dbDeleteEdge,
    getIoTRootCA,
    applyDeviceGroupCert,
    applyThingCert,
    updateThingCert,
    cancelThingCert,
    getCertPem,
    allowUserIoT,
    getThingDesc,
    deleteAlert,
    setAlert
}
