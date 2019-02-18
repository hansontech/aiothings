# AIoThings

> A sub project of AIoThings - AI + IoT Kit 
* Web frontend is a Vue.js project, that allows user to create and maintain IoT devices
* Node-RED flows and AWS services are managed and activated per user bases to construct AI + IoT applications
* Serverless backend functions are created through AWS Amplify toolchain

## AWS Amplify

> The application uses AWS Amplify as the underline framework.
> Amplify programming information can be found from [here](https://aws-amplify.github.io/docs/js/start).

## Backend services setup using AWS Amplify 

> AWS Amplify is a tool from AWS to build web application and serverless functions conveniently.
> For details, please check [AWS Amplify CLI home](https://github.com/aws-amplify/amplify-cli)

>> From recent releases, Amplify already enhanced its capability to support multiple environment and miltiple teams working together, in more specific, the supports to Git Repositiories and to CI/CD.
 
``` bash
# setup authorization and authentication
amplify add auth

## Add the AWS policies to the IAM role of Cognito Identity Pool which is used by the User Pool created:
AWSLambdaFullAccess
AmazonDynamoDBFullAccess
AWSIoTFullAccess
AmazonCognitoReadOnly
AWSIoTFullAccess

## Currently, Amplify is unable to attach the policies to individual resources through CLI, and a convinient trick can be to define a common AWS Role with attached pollicies sufficient enough to use the resources. 
## The role creation and assignment tasks must be done by AWS console separately. And the side-effect of the works, actions of removing a resource may be failed, if the role is used by other resources as well.

# setup Api Gateways and Lambda functions
amplify add api

# it defines thingApi, solutionApi, mserviceApi, userApi, iftttApi.

# setup Lambda functions that are used by API gateways. 
# API gateways define paths that will be filtered and processed by the corresponding Lambda functions.

amplify add function

# Further definitions of Apis and functions are:
# In general, the authentication option of the API gateways are set to AWS_IAM, unless otherwise sepecified.

# thingApi
### /things
### /iot-allow 
### /edge 
### /edge/deploy 
### /edge/deploy/status 
### /edge/definition 
# to use thingFunction

# solutionApi
### /solutions
# to use solutionFunction

# mservicesApi
### /checkname 
### /favorites 
### /favorite-mservices 
### /messagetrees 
### /mservices 
# to use mservicesFunction 

# userApi
### /users 
# to use userFunction

# iftttApi
### /ifttt/v1/status 
### /ifttt/v1/user/info 
### /ifttt/v1/triggers 
### /ifttt/v1/actions 
### /ifttt/v1/test/setup
# For all paths, the authorization types are set to 'none', instead of AWS_IAM
# iftttFunction

# AWS policy requirements for each Lambda function:

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

# setup hosting service, this will create a static site on S3 storage, and a CloudFront HTTPS secured url too
# The service uses aiot-bucket andaiot-greengrass-bucket two S3 buckets.
amplify add hosting

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
* For SNI Custom SSL, go through Amazon Certificate Manager (ACM) service to request AWS generate a certificate for your domain.
* After the verification of the domain name ownership, the certificate will be available to select from the CloudFront setting.
* In CloudFront, enter your domain name (www.abc.com) as CNAMEs field, and select the generated SSL Certificate.

## Tricks for debug online or local test

* Since authentication flow of AWS Cognito requires https url mandatorilly, it needs utilize CloudFront service for online test.
* As CloudFront caches the pages through TTL, during new hosting page updates, the caches need to be invalidated.
``` bash
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION ID in CloudFront] --paths "/*"
```

* For local test, Congnito console -> User Pool -> App integration -> App client settings -> App Sign In and Sign Out URLs needs to switch to http://localhost:8080/callback and http://localhost:8080/signout in order to receive authentication information from AWS Cognito properly.

