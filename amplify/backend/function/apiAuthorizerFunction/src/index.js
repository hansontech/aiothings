// A simple token-based authorizer example to demonstrate how to use an authorization token 
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke 
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke 
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value, 
// the authorizer returns an HTTP 500 status code. 
// Note that token values are case-sensitive.

const aws = require('aws-sdk');

exports.handler =  async function(event, context, callback) {
  /*
  https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html
  */
  try {
    let authStr = event.authorizationToken
    let authList = authStr.split(' ')
    let token = authList[0]
    if (authList.length > 1 && authList[0] === 'Bearer') {
      token = authList[1]
    }
    // console.log('event: ', event)
    // console.log('token: ', token)
    let cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()
    let userData = null
    userData = await cognitoidentityserviceprovider.getUser({
      AccessToken: token /* required */
    }).promise()
    if (userData === null) {
      // callback('Error: Invalid token'); // Return a 500 Invalid token response
      console.log('anonymous access is denied.')
      callback(null, generatePolicy('anonymous', 'Deny', event.methodArn));
    } else {
      let restApiId = event.methodArn.split(':')[5].split('/')[0]
      console.log('restApiId: ', restApiId)
      let apigateway = new aws.APIGateway({apiVersion: '2015-07-09'});
      let apiData = await apigateway.getRestApi( {
        restApiId: restApiId /* required */
      }).promise();
      console.log('apiName: ', apiData.name)
      let dynamodb = new aws.DynamoDB.DocumentClient();
      let apiQueryData = await dynamodb.query({
        TableName: 'atApiTable',
        IndexName: 'ApiName-index',
        KeyConditions: {
          'ApiName': {
            'ComparisonOperator': 'EQ',
            'AttributeValueList': { 
              'S' : apiData.name 
            }
          }
        }
      }).promise()
      let action = 'Deny'
      if (apiQueryData !== null && apiQueryData.Items.length > 0) {
        let api = apiQueryData.Items[0]
        if (api.UserId === userData.Username || api.AuthorizationType === 'AUTH-SHARE') {
          action = 'Allow'
        }
      }
      console.log('access is set to: ', action)
      callback(null, generatePolicy(userData.Username, action, event.methodArn))
    }
  } catch (e) {
    console.log('error: ', e)
    callback(null, generatePolicy('anonymous', 'Deny', event.methodArn));
  }
};

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
  var authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
      var policyDocument = {};
      policyDocument.Version = '2012-10-17'; 
      policyDocument.Statement = [];
      var statementOne = {};
      statementOne.Action = 'execute-api:Invoke'; 
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  /*
  authResponse.context = {
      "stringKey": "stringval"
  };
  */
  return authResponse;
}
