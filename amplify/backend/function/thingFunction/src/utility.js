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

// Put IoT cert info into Dynamodb
let dbInsertCertinfo = ( userId, certId, thingId, thingNameTag, desc, publicKey, privateKey, callback ) => {
  let itemList =  {
    'UserId': userId,
    'CertId': certId,
    'ThingId': thingId,
    'ThingName': thingNameTag,
    'ThingDesc': desc,
    'PrivateKey': privateKey,
    'PublicKey': publicKey
  };
  var params = {
    TableName: Device_TABLE_NAME,
    Item: itemList
  };
  // console.log('db item: ', itemList)
  dynamoDb.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback( err );
    } else {
      callback( null, itemList );
    }
  });
}

// Put IoT cert info into Dynamodb
let dbUpdateCertinfo = ( userId, iotcert, thingNameTag, desc, callback ) => {
   
  dynamoDb.update({
    TableName: Device_TABLE_NAME,
    Key:{
        'UserId': userId,
        'CertId': iotcert
    },
    UpdateExpression: 'set ThingDesc = :desc, ThingName = :name',
    ExpressionAttributeValues:{
        ':desc': desc,
        ':name': thingNameTag 
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
let dbDeleteCertinfo = ( userId, iotcert, callback ) => {
 
  var params = {
    TableName: Device_TABLE_NAME,
    Key: {
      'UserId': userId,
      'CertId': iotcert
    }
  };
  dynamoDb.delete(params, function(err, data) {
    if (err) {
      console.log('dynamoDb delete: error: ', err);
      callback( err );
    } else {
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
    ExpressionAttributeNames:{
        '#userid': 'UserId'
    },
    ExpressionAttributeValues: {
        ':userid': userId
    },
    ProjectionExpression: "ThingName, ThingDesc, ThingId, CertId, UserId, EdgeData"
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
let dbGetCertinfo = ( userId, iotcert, callback ) => {

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

  dynamoDb.query(params, function(err, data) {
    if (err) {
        console.log('getCertinfo: Unable to query. Error:', JSON.stringify(err, null, 2));
        callback(err)
    } else {
        console.log('getCertinfo: Query succeeded.');
        let dataJson = data.Items
        callback( null, dataJson );
    }
  });  
}

// AWS IOT reference
// Language examples
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html
// Detail AWS IOT API information
// https://docs.aws.amazon.com/iot/latest/apireference/Welcome.html

// Apply cert & Attach thing, policy
let applyThingCert = ( userId, thingNameTag, callback ) => {
  console.log('applyCert region: ', config.region)  
  console.log('userId: ', userId)  
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  var params = {
    setAsActive: true
  };
  // Create cert
  iot.createKeysAndCertificate(params, function(err, certData) {
    // console.log(certData);
    if (err){
      console.log(err, err.stack); // an error occurred
      callback(err)
    } 
    else{
      // let datetime = (new Date()).getTime()
      // console.log('applyThingCert: certData: ', certData)
      //let thingId = userId + '_' + datetime
      let thingId = userId + '_' + thingNameTag
      // Create IoT Policy for above cert
      var params = {
        policyDocument: config.POLICY_DOCUMENT, /* required */
        policyName: thingId /* required */
      };
      console.log('policy params: ', params)
      iot.createPolicy(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          callback(err)
        } 
        else{
          // Attach policy for cert
          var params = {
            policyName: thingId, /* required */
            target: certData.certificateArn /* required */
          };
          iot.attachPolicy(params, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              callback(err)
            }
            else {
              // Create thing for cert
              var params = {
                thingName: thingId, /* required */
                attributePayload: {
                  attributes: {
                    'Application': 'AIOT',
                    'UserId': userId                  
                  },
                  merge: true || false
                }
              };
              iot.createThing(params, function(err, data) {
                if (err) {
                  console.log(err, err.stack); // an error occurred
                  callback(err)
                }
                else {
                  let certArn = certData.certificateArn
                  let certId = certData.certificateId
                  // Attach thing for cert
                  var params = {
                    principal: certArn, /* required */
                    thingName: thingId /* required */
                  };
                 
                  iot.attachThingPrincipal(params, function(err, thingData) {
                    if (err) {
                      console.log(err, err.stack); // an error occurred
                      callback(err)
                    }
                    else {
                      callback( null, certId, thingId, certData);
                    }
                  });
                }
              });
            }
          });
        }
      });
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
                      iot.deleteThing(deleteThingParams, function(err, data) {
                        if (err) {
                          console.log(err, err.stack); // an error occurred
                          callback(err)
                        }
                        else{
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
    dbUpdateEdge,
    dbUpdateEdgeAsync,
    dbDeleteEdge,
    getIoTRootCA,
    applyThingCert,
    cancelThingCert,
    getCertPem,
    allowUserIoT,
    getThingDesc
}
