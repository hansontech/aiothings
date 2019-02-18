# aiothings

> A sub project of AIoThings - AI + IoT Kit 
* Web frontend is a Vue.js project, that allows user to create and maintain IoT devices
* Node-RED flows and AWS services are managed and activated per user bases to construct AI + IoT applications
* Serverless backend functions are created through AWS Amplify toolchain

## Backend services setup using AWS Amplify 

> AWS Amplify is a tool from AWS to build web application and serverless functions conveniently.
> For details, please check [AWS Amplify CLI home](https://github.com/aws-amplify/amplify-cli)

>> From recent releases, Amplify already enhanced its capability to support multiple environment and miltiple teams working together, in more specific, the supports to Git Repositiories and to CI/CD.
 
``` bash
# setup authorization and authentication
amplify add auth

# setup Api Gateways and Lambda functions
amplify add api

## resource name: thingApi, path: /things, function name: thingObject
## resource name: thingAllow, path: /iot-allow, function name: thingObject
## need to create new lambda function thingObject
## resource name: solutionApi, path: /solutions, function name: solutionFunction  

amplify add function

# setup hosting service, this will create a static site on S3 storage, and a CloudFront HTTPS secured url too
amplify add hosting

## thingApi
### /things
### /iot-allow 
### /edge 
### /edge/deploy 
### /edge/deploy/status 
### /edge/definition 
#### thingFunction

## solutionApi
### /solutions
#### solutionFunction

## mservicesApi
### /checkname 
### /favorites 
### /favorite-mservices 
### /messagetrees 
### /mservices 
#### mservicesFunction 

## userApi
### /users 
#### userFunction

## iftttApi
### /ifttt/v1/status 
### /ifttt/v1/user/info 
### /ifttt/v1/triggers 
### /ifttt/v1/actions 
### /ifttt/v1/test/setup
### For all paths, the authorization types are set to 'none' instead of AWS_IAM
#### iftttFunction

## AWS policy requirements for each Lambda function:
## thingFunction
### AmazonDynamoDBFullAccess
### AWSIoTFullAccess
### AWSGreengrassFullAccess

## servicesFunction
### AdministratorAccess ??
### AmazonS3FullAccess
### AmazonDynamoDBFullAccess
### AWSLambdaFullAccess

## userFunction
### AmazonCognitoReadOnly

## solutionFunciton
### AmazonDynamoDBFullAccess

# check setting status
amplify status

## after above settings, the status result will looks like below:

Current Environment: prod

| Category | Resource name    | Operation | Provider plugin   |
| -------- | ---------------- | --------- | ----------------- |
| Auth     | cognitoAiot      | No Change | awscloudformation |
| Hosting  | S3AndCloudFront  | No Change | awscloudformation |
| Storage  | aiotStorage      | No Change | awscloudformation |
| Function | iftttFunction    | No Change | awscloudformation |
| Function | thingFunction    | No Change | awscloudformation |
| Function | solutionFunction | No Change | awscloudformation |
| Function | mserviceFunction | No Change | awscloudformation |
| Function | userFunction     | No Change | awscloudformation |
| Api      | iftttApi         | No Change | awscloudformation |
| Api      | thingApi         | No Change | awscloudformation |
| Api      | solutionApi      | No Change | awscloudformation |
| Api      | mserviceApi      | No Change | awscloudformation |
| Api      | userApi          | No Change | awscloudformation |

Hosting endpoint: https://xxxxxxxx.cloudfront.net
# publish to cloud
amplify publish

## first time publish may take a pretty long time, please be patient and wait for its completion.
```

## Web Frontend Build Setup

> For detail explanation, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Additonal settings using AWS console

* Attach IOT Full Access Policy, and DynamoDB Full Access Policy to Lambda function thingFunction.
* Attach DynamoDB Full Access Policy to Lambda function solutionFunction.
* Attach IOT Full Access Policy, and DynamoDB Full Access Policy to Auth Role, that is assigned to the Identity Pool created through Amplify add auth. 
* Enter AWS Congnito console -> User Pool (created for this app) -> App integration -> domain name -> and set the domain name similar like 
https://xxxx.auth.ap-southeast-2.amazoncognito.com, and reflect that url to awsCognitoDomain of src/config/index.js .
* Enter AWS IOT console -> Settings -> Custom Endpoint, copy the endpoint url to awsIotHost of src/config/index.js .
* Enter AWS Congnito console -> User Pool -> App integration -> App client settings -> App Sign In and Sign Out URLs set to https://www.example.com/callback and https://www.example.com/signout
* AWS Congnito App Clients set properly

## Custom website setup using AWS CloudFront

* AWS has [document](https://aws.amazon.com/cloudfront/custom-ssl-domains/) to guide how to complete the settings. 
* Among the two approaches of it, SNI Custom SSL is recommended.
* After the verification of the domain name ownership, the a certificate will be available to assign to the CloudFront distribution.

## Tricks for debug online or local test

* Since authentication flow of AWS Cognito requires https url mandatorilly, it needs utilize CloudFront service for online test.
* As CloudFront caches the pages through TTL, during new hosting page updates, the caches need to be invalidated.
``` bash
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION ID in CloudFront] --paths "/*"
```

* For local test, Congnito console -> User Pool -> App integration -> App client settings -> App Sign In and Sign Out URLs needs to switch to http://localhost:8080/callback and http://localhost:8080/signout in order to receive authentication information from AWS Cognito properly.

