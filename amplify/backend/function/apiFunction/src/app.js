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
  awsUserPoolId: "ap-southeast-2_2gQEl126n"
};
aws.config.region = config.region;
const dynamodb = new aws.DynamoDB.DocumentClient();
const apigateway = new aws.APIGateway({apiVersion: '2015-07-09'});


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
  try {
    await apigateway.deleteBasePathMapping({
      basePath: apiName.toLowerCase(),
      domainName: config.apiDomainName
    }).promise()
    /*
    await apigateway.deleteStage({
      restApiId: restApiId,
      stageName: 'prod' 
    }).promise()  // must be deleted first
    */
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
    return true
  } catch (err) {
    console.log('deleteApi: ', err)
    return false
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
      await deleteApi(existingApiObject.ApiName, existingApiObject.RestApiId, existingApiObject.DeploymentId)
      isCreateNewApi = true
    }
  }
  if (isCreateNewApi === true) {
    // create an Api Gateway structure  
    try {
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
      let parentResourceId = rootResourceId
      let parentResourceTree = []
      for( let pathFull of apiObject.Paths) {
        let pathParts = pathFull.split('/')
        let level = 0
        for (let pathLevel in pathParts) {
          let pathPart = pathParts[pathLevel]
          let resourceData = await apigateway.createResource({
            parentId: parentResourceId,
            pathPart: pathPart,
            restApiId: restApiId
          }).promise()
          let resourceId = resourceData.id

          if (level === pathParts.length-1) {
            await createLeafPath(restApiId, resourceId, inputs.handler)
            continue
          } 
          // otherwise
          let resourceFound = parentResourceTree.find(resource => resource.pathName === pathPart)
          if (resourceFound === undefined || resourceFound.length === 0) {
            resourceFound = [{pathName: pathPart, resourceId: resourceId, subtree: []}]
            parentResourceTree.push(resourceFound[0])
          }
          parentResourceId = resourceFound[0].resourceId
          parentResourceTree = resourceFound[0].subtree
          level++
        } // for each path level of a path case
      } // for each path case 

      let deploymentData = await apigateway.createDeployment({
        restApiId: restApiId,
        stageName: 'prod'
      }).promise()
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

  // createLeafPath - 
  async function createLeafPath(restApiId, resourceId, mservice) {
      for(let methodStr of ['POST', 'GET', 'PUT', 'DELETE']){
        await apigateway.putMethod({
          restApiId: restApiId,
          resourceId: resourceId,
          httpMethod: methodStr,
          authorizationType: apiObject.AuthorizationType,  // NONE | AWS_IAM | COGNITO_USER_POOLS
          apiKeyRequired: false
        }).promise()
        await apigateway.putIntegration({
          httpMethod: methodStr,
          resourceId: resourceId,
          restApiId: restApiId,
          type: 'AWS_PROXY',
          integrationHttpMethod: methodStr,
          uri: 'arn:aws:apigateway:' + config.region + ':lambda:path/2015-03-31/functions/' + mservice.ServiceArn + '/invocations'
        }).promise()
        // arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT:function:$FUNCTION_NAME/invocation
        await apigateway.putMethodResponse({
          httpMethod: methodStr,
          resourceId: resourceId,
          restApiId: restApiId,
          statusCode: '200',
          responseModels: { 'application/json' : 'Empty'}  // content type: 
        })
        await apigateway.putIntegrationResponse({
          httpMethod: methodStr,
          resourceId: resourceId,
          restApiId: restApiId,
          statusCode: '200',
          responseTemplates: { 'application/json' :  ''}
        }).promise()
      } // for methods
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
  }
  if (dbGetData !== null && dbGetData.Item !== undefined) {
    let apiItem = dbGetData.Item
    if (apiItem.hasOwnProperty('RestApiId') && apiItem.hasOwnProperty('DeploymentId')) {
      await deleteApi(apiObject.ApiName, apiItem.RestApiId, apiItem.DeploymentId)
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
