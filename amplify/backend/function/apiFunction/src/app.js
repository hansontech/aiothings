/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const aws = require('aws-sdk');
var fs = require('fs-extra');

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

var config = {
  apiDomainName: 'api.aiothings.com',
  apiTableName: "atApiTable",
  mserviceTableName: "atServiceTable",
  relationTableName: "atRelationTable",
  mserviceTableIndexByUserId: "UserId-index",
  region: "ap-southeast-2",
  mserviceRole: "arn:aws:iam::414327512415:role/aiot-mservice-role-default",
  awsUserPoolId: "ap-southeast-2_2gQEl126n",
  apiGatewayAuthorizerFunction: 'apiAuthorizerFunction-prod'
};
aws.config.region = config.region;
const dynamodb = new aws.DynamoDB.DocumentClient();
const apigateway = new aws.APIGateway({apiVersion: '2015-07-09'});
let lambda = new aws.Lambda();

/**********************
 * Example get method *
 **********************/

app.get('/apis', function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  let condition = {}
  console.log('api query: ', query)
  if (query.userId === undefined) {
    res.json(null)
    return
  }

  const partitionKeyName = 'UserId'
  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }
  condition[partitionKeyName]['AttributeValueList'] = { 'S' : query.userId }
  let queryParams = {
    TableName: config.apiTableName,
    KeyConditions: condition
  } 
  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      console.log('get apis error: ', err)
      res.json({error: err})
    } else {
      let resultData = data.Items
      res.json({error: null, result: resultData})
    }
  });
});

app.get('/apis/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/checkname', function(req, res) {
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  console.log('query: ', query)
  if (query.apiName !== null) {
    let condition = {}
    const partitionKeyName = 'ApiName'
    condition[partitionKeyName] = {
      ComparisonOperator: 'EQ'
    }
    condition[partitionKeyName]['AttributeValueList'] = { 'S' : query.apiName }
    let getItemParams = {
      TableName: config.apiTableName,
      IndexName: 'ApiName-index',
      KeyConditions: condition
    }
    dynamodb.query(getItemParams, (err, data) => {
      if (err) {  // not found, means a new mservice
        console.log('err: ', err)
        res.json({error: err});
      } else {
        if (data.Items !== undefined){
          res.json({error: null, api: data.Items});
        } else {
          res.json({error: null, api: null});
        }
      }
    });
  } else {
    res.json({error: 'no api name assigned'});
  }
});

/****************************
* Example post method *
****************************/

// deleteApi -
async function deleteApi (apiName, restApiId, deploymentId) {
  console.log('deleteApi')
  await apigateway.deleteBasePathMapping({
    basePath: apiName.toLowerCase(),
    domainName: config.apiDomainName
  }).promise().catch((err) => {
    console.log('warn: ', err)  
  }) // assume complaining about the base path map has been deleted previously
  try {
    await apigateway.deleteStage({
      restApiId: restApiId,
      stageName: 'prod' 
    }).promise()  // must be deleted first
    await apigateway.deleteDeployment({
      deploymentId: deploymentId,
      restApiId: restApiId
    }).promise()
    /* -- No need to delete resources seperately
    let resourcesData = await apigateway.getResources({
      restApiId: restApiId
    }).promise()
    for (let resource of resourcesData.items) {
      let resourceId = resource.id
      if (resource.path !== '/') {
        await apigateway.deleteResource({
          resourceId: resourceId,
          restApiId: restApiId
        }).promise()
      }
    }
    */
    await apigateway.deleteRestApi({
      restApiId: restApiId
    }).promise()
    return null
  } catch (err) {
    console.log('deleteApi: ', err)
    return {error: err}
  }
}

app.post('/apis', async function(req, res) {
  // Add your code here
  const inputs = req.body
  let apiObject = inputs.api
  let dbGetData = null
  try {
    dbGetData = await dynamodb.get({
      TableName: config.apiTableName,
      Key: {UserId: apiObject.UserId, ApiName: apiObject.ApiName}
    }).promise()
  } catch(err) {
    console.log('db get: ', err)
  }
  let isCreateNewApi = true
  if (dbGetData !== null && dbGetData.Item !== undefined) {
    // means an existing api defined already
    let existingApiObject = dbGetData.Item
    isCreateNewApi = false
    // check if paths is equal to that before, then no need to do following
    let existingPathsStr = JSON.stringify(existingApiObject.Paths)
    let newPathStr = JSON.stringify(apiObject.Paths)
    if ((existingPathsStr !== newPathStr) || 
          existingApiObject.Handler !== apiObject.Handler ||
          existingApiObject.AuthorizationType != apiObject.AuthorizationType) {
         // release resources from previous the definition
      let deleteResult = await deleteApi(existingApiObject.ApiName, existingApiObject.RestApiId, existingApiObject.DeploymentId)
      isCreateNewApi = true
      if (deleteResult !== null && deleteResult.hasOwnProperty('error')) {
        // console.log('error: ', deleteResult.error.message)
        if (deleteResult.error.message.includes('Invalid API identifier')) {
        } else {
          res.json(deleteResult);
          return
        }
      }
    }
  }
  console.log('continue creating api..')
  if (isCreateNewApi === true) {
    // create an Api Gateway structure  
    try {
      // console.log('before updateFunction')
      await updateFunction(inputs.handler.ServiceName, apiObject.ApiName)
      let restApiData = await apigateway.createRestApi({
        name: apiObject.ApiName,
        description: apiObject.Desc,  // Keep only the first time Desc value
        apiKeySource: 'HEADER', // source of the API key for metering requests according to a usage plan
        endpointConfiguration: {
          types: [
            'EDGE'
          ]
        }
      }).promise()
      let restApiId = restApiData.id
      let resourcesData = await apigateway.getResources({
        restApiId: restApiId
      }).promise()
      let rootResourceId = ''
      for (let resource of resourcesData.items) {
        if (resource.path === '/') {
          rootResourceId = resource.id
        }
      }
      let parentResourceTree = []
      for( let pathFull of apiObject.Paths) { // for every path
        let pathParts = pathFull.split('/')
        let level = 0
        let subPath = ''
        let parentResourceId = rootResourceId
        for (let pathLevel in pathParts) {  // for each path level of the path
          let pathPart = pathParts[pathLevel]
          subPath = subPath + '/' + pathPart
          let resourceFound = parentResourceTree.find(resource => {
            let result = resource.pathName === subPath
            return result
          })
          console.log('parentResourceTree: ', parentResourceTree)
          console.log('resourceFound: ', resourceFound)
          let resourceId = null          
          if (resourceFound === undefined) {
            // if the path level is first reached, then construct the tree entry
            let resourceData = await apigateway.createResource({
              parentId: parentResourceId,
              pathPart: pathPart,
              restApiId: restApiId
            }).promise()  // create resource for each path level
            let resource = {pathName: subPath, resourceId: resourceData.id}
            parentResourceTree.push(resource)
            resourceId = resourceData.id
          } else {
            resourceId = resourceFound.resourceId           
          }
          console.log('level: ', level)
          console.log('pathParts level: ', pathParts.length)
          if (level === pathParts.length-1) { // if it is the end level of the path
            await createLeafPath(apiObject.ApiName, pathFull, restApiId, resourceId, inputs.handler)
          } else {
            // otherwise
            parentResourceId = resourceId
            level++
          }
        } // for each path level of a path case
      } // for each path case 
      // console.log('before deployment')
      let deploymentData = await apigateway.createDeployment({
        restApiId: restApiId,
        stageName: 'prod'
      }).promise()
      // console.log('before createBasePathMapping')
      let deploymentId = deploymentData.id
      await apigateway.createBasePathMapping( {
        domainName: config.apiDomainName,
        restApiId: restApiId,
        basePath: apiObject.ApiName.toLowerCase(),
        stage: 'prod'
      }).promise()
      apiObject.RestApiId = restApiId
      apiObject.DeploymentId = deploymentId
    } catch (err) {
      console.log(err)
      res.json({error: err})
      return
    }
  } // end if create new Api structure
  console.log('db put')
  try {
    let dbData = await dynamodb.put({
      TableName: config.apiTableName,
      Item: apiObject
    }).promise()
    res.json({error: null, result: apiObject})
  } catch (err) {
    res.json({error: err})
  }
  
  /*  ApiObject structure
        UserId
        ApiName
        Desc
        Paths
        RestApiId
        DeploymentId
  */

  async function updateFunction(functionName, apiName) {
    try {
      let funcData = await lambda.getFunctionConfiguration({
        FunctionName: functionName
      }).promise()
      let funcEnvs = funcData.Environment.Variables
      if (funcEnvs.hasOwnProperty('API_GATEWAY_NAME') === false) {
        let addPermissionPromise = lambda.addPermission({
          Action: "lambda:InvokeFunction", 
          FunctionName: functionName, 
          Principal: "apigateway.amazonaws.com", 
          StatementId: functionName + "_appgw_invoke"
        }).promise()
        await addPermissionPromise.catch( function (err) { 
          console.log('updateFunction addPermission error: ', err) // an error occurred
        })
      }
      funcEnvs.API_GATEWAY_NAME = apiName
      await lambda.updateFunctionConfiguration({
        FunctionName: functionName, /* required */
        Environment: {
          Variables: funcEnvs
        }
      }).promise()
    } catch (err) {
      console.log('updateFunction err: ', err)
    }
  }
  // createLeafPath - 
  async function createLeafPath(apiName, pathFull, restApiId, resourceId, mservice) {
    console.log('createLeafPath: ', pathFull)
    try{
      for(let methodStr of ['ANY']){ // ['POST', 'GET', 'PUT', 'DELETE']){
        let authType = apiObject.AuthorizationType
        switch (authType) {
          case 'NONE': 
            authType = 'NONE'
          break
          case 'AUTH': 
            authType = 'CUSTOM'
            break
          case 'AUTH-SHARE':
            authType = 'CUSTOM'
            break
          default:
            break
        }
        let putMethodParas = {
          restApiId: restApiId,
          resourceId: resourceId,
          httpMethod: methodStr,
          authorizationType: authType,  // NONE | AWS_IAM | COGNITO_USER_POOLS | CUSTOM
          apiKeyRequired: false
        }
        if (putMethodParas.authorizationType === 'CUSTOM') {
          let apiGatewayAuthorizer = 'aiotApiGatewayAuthorizer'
          let authorizersData = await apigateway.getAuthorizers({
            restApiId: restApiId, /* required */
          }).promise()
          console.log('authorizersData.items: ', authorizersData.items)
          let authorizer = authorizersData.items.find( item => {
            return item.name === apiGatewayAuthorizer
          })
          let authorizerData = null
          console.log('authorizer: ', authorizer)
          if (typeof authorizer !== 'undefined') {
            authorizerData = authorizer
          } else {
            console.log('createAuthorizer')
            let authorizerFuncData = await lambda.getFunctionConfiguration({
              FunctionName: config.apiGatewayAuthorizerFunction
            }).promise()
            if (authorizerFuncData.Role !== config.mserviceRole) {
              await lambda.updateFunctionConfiguration({
                FunctionName: config.apiGatewayAuthorizerFunction, /* required */
                Role: config.mserviceRole
              }).promise()
            }
            authorizerData = await apigateway.createAuthorizer({
              name: apiGatewayAuthorizer, /* required */
              restApiId: restApiId, /* required */
              type: 'TOKEN', // TOKEN | REQUEST | COGNITO_USER_POOLS, /* required */
              identitySource: 'method.request.header.Authorization',
              authorizerUri: 'arn:aws:apigateway:' + config.region + ':lambda:path/2015-03-31/functions/' + authorizerFuncData.FunctionArn + '/invocations',
              authorizerCredentials: config.mserviceRole
            }).promise();
            /*
              The role (authorizerCredentials) needs to include following to [Trust relationships] tab of role definition
              {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Effect": "Allow",
                    "Principal": {
                      "Service": [
                        "apigateway.amazonaws.com",
                        "lambda.amazonaws.com"
                      ]
                    },
                    "Action": "sts:AssumeRole"
                  }
                ]
              }
            */
          }
          putMethodParas.authorizerId = authorizerData.id
        }
        await apigateway.putMethod(putMethodParas).promise()
        // console.log('putIntegration')
        let functionArn = mservice.ServiceArn.replace(':' + mservice.ServiceName + '_Latest', '')
        await apigateway.putIntegration({
          httpMethod: methodStr,
          resourceId: resourceId,
          restApiId: restApiId,
          type: 'AWS_PROXY',
          credentials: null,
          /*  For the Lambda integration, 
              you can call the Lambda's addPermission action to set the resource-based permissions 
              and then set credentials to null in the API Gateway integration request.
              https://docs.aws.amazon.com/apigateway/latest/developerguide/integration-request-basic-setup.html

              or, assign arn:aws:iam::account-id:role/iam-role-name to allow invoke lambda
          */
          integrationHttpMethod: 'POST',
          uri: 'arn:aws:apigateway:' + config.region + ':lambda:path/2015-03-31/functions/' + functionArn + '/invocations'
        }).promise()
        // arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/{arn:aws:lambda:$REGION:$ACCOUNT:function:$FUNCTION_NAME}/invocations
        // console.log('putMethodResponse')
        await apigateway.putMethodResponse({
          httpMethod: methodStr,
          resourceId: resourceId,
          restApiId: restApiId,
          statusCode: '200',
          responseModels: { 'application/json' : 'Empty'}  // content type: 
        }).promise()
        // console.log('putIntegrationResponse')
        await apigateway.putIntegrationResponse({
          httpMethod: methodStr,
          resourceId: resourceId,
          restApiId: restApiId,
          statusCode: '200',
          responseTemplates: { 'application/json' :  ''}
        }).promise()
        let corsTemplate = fs.readFileSync('./cors-template.yaml', 'utf8')
        // console.log('corsTemplate: ', corsTemplate)
        corsTemplate = corsTemplate.replace(/\[PATH\]/g, pathFull)
        corsTemplate = corsTemplate.replace(/\[API\]/g, apiName)
        // console.log('cors: ', corsTemplate)
        await apigateway.putRestApi({
          body: Buffer.from(corsTemplate) /* Strings will be Base-64 encoded on your behalf */, /* required */
          restApiId: restApiId, /* required */
          failOnWarnings: false,
          mode: 'merge'
        }).promise()
      } // for methods
    } catch (err) {
      console.log('createLeafPath err: ', err)
    }
  } // end of function createLeafPath
});

app.post('/apis/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example post method *
****************************/

app.put('/apis', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/apis/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/apis', async function(req, res) {
  // Add your code here
  let event = req.apiGateway.event;
  let query = event.queryStringParameters;
  let apiObject = JSON.parse(query.api)
  if (apiObject === undefined) {
    res.json({error: 'need API object provided'})
    return
  }
  let dbGetData = null
  try {
    dbGetData = await dynamodb.get({
      TableName: config.apiTableName,
      Key: {UserId: apiObject.UserId, ApiName: apiObject.ApiName}
    }).promise()
  } catch(err) {
    console.log('db get: ', err)
    res.json({error: err});
    return
  }
  if (dbGetData !== null && dbGetData.Item !== undefined) {
    let apiItem = dbGetData.Item
    if (apiItem.hasOwnProperty('RestApiId') && apiItem.hasOwnProperty('DeploymentId')) {
      let deleteResult = await deleteApi(apiObject.ApiName, apiItem.RestApiId, apiItem.DeploymentId)
      if (deleteResult !== null && deleteResult.hasOwnProperty('error')) {
        if (deleteResult.error.includes('NotFoundException')) {
        } else {
          res.json(deleteResult);
          return
        }
      }
    }
  }
  let params = {}
  params['UserId'] = apiObject.UserId;
  params['ApiName'] = apiObject.ApiName;
  let deleteParams = {
    TableName: config.apiTableName,
    Key: params
  };
  dynamodb.delete(deleteParams, (err, data) => {
    if (err) {
      console.log('api db delete error: ', err);
      res.json({error: err});
    } else {
      res.json({error: null});
    }
  });
});

app.delete('/apis/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
