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
var util = require('util')

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

// aiothings imports
var gulp = require('gulp');
var gulpZip  = require('gulp-zip');
var gulpInstall = require('gulp-install');
var gulpReplace = require('gulp-replace');
var fs = require('fs-extra');
const aws = require('aws-sdk');
const splitargs = require('splitargs');
var AdmZip = require("adm-zip");
var dateTime = require("date-time");
var md5 = require("md5");
var mime = require('mime-types');
// const config = require('./config');

// import Lambda Environment variables
// var environment = process.env;
// var environment = {"REGION":"ap-southeast-2"}

var config = {
    mserviceTableName: "atServiceTable",
    relationTableName: "atRelationTable",
    mserviceTableIndexByUserId: "UserId-index",
    mserviceTableIndexByInputMessageTopic: "InputMessageTopic-index",
    mserviceTableIndexBySharedUserId: "IsShared-UserId-index",
    region: "ap-southeast-2",
    awsAccountId: "414327512415",
    mserviceS3bucketName: "aiot-bucket" + '-' + process.env.ENV,
    mserviceRole: "arn:aws:iam::414327512415:role/aiot-mservice-role-default",
    awsIotEndpoint: "a3vgppxo7lddg8-ats.iot.ap-southeast-2.amazonaws.com",
    awsUserPoolId: "ap-southeast-2_GETSSHigP",
    adminUsers: ["Facebook_10212683421500597", "system", "root"],
    userDataTable: 'atUserDataTable'
};

aws.config.region = config.region;
const dynamodb = new aws.DynamoDB.DocumentClient();

/**********************
 * Example get method *
 **********************/

app.get('/mservices', async function(req, res) {
  // Add your code here
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  let condition = {}
  console.log('query: ', query)
  if (query.userId && query.isShared === 'true') {
    console.log('query shared: ', query.isShared)
    try {
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.Js.04.html
      let scanParams = {
        TableName: config.mserviceTableName,
        FilterExpression: "#isShared = :isShared AND UserId <> :userId",
        ExpressionAttributeNames: {
          "#isShared": "IsShared",
        },
        ExpressionAttributeValues: {
          ":isShared": query.isShared,
          ":userId": query.userId
        }
      };
      if (typeof query.searchText !== "undefined") {
        var searchWordList = splitargs(query.searchText);
        console.log(searchWordList);
        if (searchWordList.length > 0) {
          scanParams.FilterExpression += " AND ";
          for (let searchWordIndex in searchWordList) {
            if (searchWordIndex == 0) { // numeric comparison
              scanParams.FilterExpression += " ( ";
            } else {
              scanParams.FilterExpression += " OR ";
            }
            let searchWord = searchWordList[searchWordIndex].toLowerCase();
            let attributeValue = ":searchWord" + searchWordIndex;
            scanParams.FilterExpression += "contains(QueryString, " + attributeValue + ")"
              // "contains(ServiceDesc, " + attributeValue + ") OR contains(ServiceName, " + attributeValue + ") "
            scanParams.ExpressionAttributeValues[attributeValue] = searchWord
            // contains is case sensitive
          }
          scanParams.FilterExpression += " )";
        }
      }
      console.log('start scan: ', scanParams);
      let msList = []
      do {
        let data = await dynamodb.scan(scanParams).promise()
        msList = msList.concat(data.Items)
        if (typeof data.LastEvaluatedKey !== 'undefined') {
          scanParams.ExclusiveStartKey = data.LastEvaluatedKey
        } else {
          break
        }
      } while (true)
      res.json(JSON.stringify(msList));
    } catch (err) {
      res.json({error: 'Failed load shared microservices: ' + err});
    }
  } else if (query.userId) { // owned by this user
    try {
      const partitionKeyName = 'UserId'
      condition[partitionKeyName] = {
        ComparisonOperator: 'EQ'
      }
      condition[partitionKeyName]['AttributeValueList'] = { 'S' : query.userId }
      let queryParams = {
        TableName: config.mserviceTableName,
        IndexName: config.mserviceTableIndexByUserId,
        KeyConditions: condition
      }
      let msList = []
      do {
        let data = await dynamodb.query(queryParams).promise()
        msList = msList.concat(data.Items)
        if (typeof data.LastEvaluatedKey !== 'undefined') {
          queryParams.ExclusiveStartKey = data.LastEvaluatedKey
        } else {
          break
        }
      } while (true)
      let resultData = JSON.stringify(msList);
      res.json(resultData);
    } catch (err) {
      console.log('get mservices error: ', err)
      res.json({error: 'Failed load mservices: ' + err});
    }
  }
});

app.get('/mservices/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/messagetrees', async function(req, res) {
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  console.log('query: ', query)
  let mservicesRelated = []
  let mservicesReachedMap = {}   
  const partitionKeyName = 'UserId'
  let condition = {}
  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }
  condition[partitionKeyName]['AttributeValueList'] = { 'S' : query.userId }
  let queryParams = {
    TableName: config.mserviceTableName,
    IndexName: config.mserviceTableIndexByUserId,
    KeyConditions: condition
  }
  try {
    let mservices = []
    do {
      let data = await dynamodb.query(queryParams).promise()
      // Following globals will be added through recursive call trees
      // mservicesRelated 
      // mservicesReachedMap    
      mservices = mservices.concat(data.Items)
      if (typeof data.LastEvaluatedKey !== 'undefined') {
        scanParams.ExclusiveStartKey = data.LastEvaluatedKey
      } else {
        break
      }
    } while (true)
    await getMessageTrees(mservices)
    resultData = JSON.stringify(mservicesRelated)
    res.json(resultData)
  } catch (err) {
    console.log('trees: query mservices error: ', err)
    res.json(JSON.stringify({error: err}))
  }

  async function getMessageTrees (mservices) {
    for (let mservice of mservices) {
      if (typeof mservicesReachedMap[mservice.ServiceName] === 'undefined') {
        mservicesReachedMap[mservice.ServiceName] = true
        mservicesRelated.push(mservice)

        let outputMessageTopic = mservice.OutputMessageTopic
        const partitionKeyName = 'InputMessageTopic'
        let condition = {}
        condition[partitionKeyName] = {
          ComparisonOperator: 'EQ'
        }
        condition[partitionKeyName]['AttributeValueList'] = { 'S' : outputMessageTopic }
        let queryParams = {
          TableName: config.mserviceTableName,
          IndexName: config.mserviceTableIndexByInputMessageTopic,
          KeyConditions: condition
        }
        try {
          let queryPromise = dynamodb.query(queryParams).promise()
          let data = await queryPromise.catch(function(error) {
            console.log('rejection: ', queryPromise, ' : ', error);
            res.json(JSON.stringify({error: error}))
          });
          let mservicesWithInputMessage = data.Items;
          if (mservicesWithInputMessage !== null && mservicesWithInputMessage.length > 0) {
              await getMessageTrees(mservicesWithInputMessage)
          }
        } catch (err) {
          console.log('trees: query input message error: ', err)
          res.json(JSON.stringify({error: err}))
        }
      } // if condition
    } // for loop
  } // function getMessageTrees
});
app.get('/checkname', function(req, res) {
  let event = req.apiGateway.event
  let query = event.queryStringParameters
  console.log('query: ', query)
  if (query.serviceName !== null) { // owned by this user
    let params = {};
    partitionKeyName = 'ServiceName'
    params[partitionKeyName] = query.serviceName
    let getItemParams = {
      TableName: config.mserviceTableName,
      Key: params
    }
    dynamodb.get(getItemParams, (err, data) => {
      if (err) {  // not found, means a new mservice
        console.log('err: ', err)
        res.json({success: 'new'});
      }else {
        console.log('data item: ', data.Item)
        if (typeof data.Item !== 'undefined'){
          res.json({success: 'used', mservice: data.Item});
        } else {
          res.json({success: 'new'});
        }
      }
    });
  } else {
    res.json({success: 'new'});
  }
});

app.get('/favorites', function(req, res) {
  let event = req.apiGateway.event;
  let query = event.queryStringParameters;
  console.log('query: ', query);
  if (typeof query.serviceName !== 'undefined' && query.serviceName !== null) { // owned by this user
    let params = {};
    params['UserId'] = query.userId;
    params['ServiceName'] = query.serviceName;
    let getRelationParams = {
      TableName: config.relationTableName,
      Key: params
    }
    dynamodb.get(getRelationParams, (err, data) => {
      if (err) {  // not found, means a new mservice
        console.log('err: ', err);
        res.json({error: err});
      }else {
        console.log('get success');
        if (typeof data.Item !== 'undefined'){
          res.json({success: data.Item});
        } else {
          res.json({success: null});
        }
      }
    });
  } else {
    let condition = {}
    condition['UserId'] = {
      ComparisonOperator: 'EQ'
    }
    condition['UserId']['AttributeValueList'] = { 'S' : query.userId }
    queryParams = {
      TableName: config.relationTableName,
      KeyConditions: condition
    } 
    dynamodb.query(queryParams, (err, data) => {
      if (err) {  // not found, means a new mservice
        console.log('query err: ', err);
        res.json({error: err});
      }else {
        console.log('query success');
        let resultData = JSON.stringify(data.Items);
        res.json(resultData);
      }
    });
  }
});

app.get('/favorite-mservices', function(req, res) {
  let event = req.apiGateway.event;
  let query = event.queryStringParameters;
  console.log('query: ', query);

  let condition = {}
  condition['UserId'] = {
    ComparisonOperator: 'EQ'
  }
  condition['UserId']['AttributeValueList'] = { 'S' : query.userId }
  queryParams = {
    TableName: config.relationTableName,
    KeyConditions: condition
  }
  dynamodb.query(queryParams, async (err, data) => {
    if (err) {  // not found, means a new mservice
      console.log('query err: ', err);
      res.json({error: err});
    }else {
      console.log('favorite list query success: ', data.Items);
      let mservices = await getServices(data.Items);
      console.log('favorite services:', mservices);
      let mservicesData = JSON.stringify(mservices);
      res.json(mservicesData);
    }
  });

  async function getServices (favoriteServiceList) {
    let mservices = []
    for (let service of favoriteServiceList) {
      let params = {}
      console.log('service item: ', service)
      params['ServiceName'] = service.ServiceName;
      let getServiceParams = {
          TableName: config.mserviceTableName,
          Key: params
      }
      try {
        console.log('db get params: ', getServiceParams);
        let data = await dynamodb.get(getServiceParams).promise()
        let service = data.Item
        if (typeof service.IsShared !== 'undefined' && service.IsShared === 'true') {
          mservices.push(service)
        }
      } catch (e) {
        console.log('favorite services error: ', e)
        return mservices
      }
    } // for loop
    return mservices
  }
});


/****************************
* Example post method *
****************************/

app.post('/logging', async function(req, res) {
  // Add your code here
  let inputs = req.body
  console.log('logging: ', inputs);
  let lambda = new aws.Lambda();
  let cloudWatchLogs = new aws.CloudWatchLogs()
  if (inputs.enableLogging === true) {
    try {
      // let logGroupName = '/aws/lambda/' + inputs.serviceName
      // console.log('logGroupName: ', logGroupName)
      /*
      let filteredData = await cloudWatchLogs.filterLogEvents(
        inputs.filterParameter
      ).promise()
      // console.log('filteredData: ', filteredData)
      res.json(filteredData);   
      */
      // --  for logs subscription purpose 2019/11/11, may need to relocate to other place
      await lambda.removePermission({
        FunctionName: inputs.loggerName, 
        StatementId: inputs.loggerName + '_log_invoke_' + inputs.serviceName,
      }).promise().catch(function (err) { 
        console.log('deletePermission log: warning: ', err); // an error occurred
      })
      await lambda.addPermission({
        Action: "lambda:InvokeFunction", 
        FunctionName: inputs.loggerName, 
        Principal: "logs." + config.region + ".amazonaws.com",
        StatementId: inputs.loggerName + '_log_invoke_' + inputs.serviceName,
        SourceArn: 'arn:aws:logs:' + config.region + ':' + config.awsAccountId + ':log-group:/aws/lambda/' + inputs.serviceName + ':*'
      }).promise().catch( function (err) { 
        console.log('addPermission log: warning: ', err); // an error occurred
      })
      console.log('start put subscription')
      // -- in order to bypass the impact ever using Dashbird service
      // -- they use the region name as their filter name for each log group
      await cloudWatchLogs.deleteSubscriptionFilter({
        logGroupName: inputs.queryParameter.logGroupName,
        filterName: config.region
      }).promise().catch(function (err) { 
      })
      await cloudWatchLogs.putSubscriptionFilter({
        logGroupName: inputs.queryParameter.logGroupName,
        filterName: 'filter_' + inputs.serviceName,
        filterPattern: '',
        destinationArn: 'arn:aws:lambda:' + config.region + ':' + config.awsAccountId + ':function:' + inputs.loggerName
      }).promise()
      console.log('start query')
      let queryStartData = await cloudWatchLogs.startQuery(
        inputs.queryParameter
      ).promise()
      const sleep = util.promisify(setTimeout)
      do {
        await sleep(1000)
        let queryResult = await cloudWatchLogs.getQueryResults({
          queryId: queryStartData.queryId
        }).promise()
        console.log('status: ', queryResult.status)
        if (queryResult.status === 'Running' || queryResult.status === 'Scheduled') {
          continue
        } else if (queryResult.status === 'Complete') {
          res.json(queryResult)
        } else {
          res.json({error: 'The result is '+ queryResult.status})
        }
        break
      } while(true)
    } catch (err) {
      // console.log('logging: ', err)
      res.json({error: err})
    }
  } else {
    try {
      await cloudWatchLogs.deleteSubscriptionFilter({
        logGroupName: inputs.queryParameter.logGroupName,
        filterName: 'filter_' + inputs.serviceName,
      }).promise()
    } catch (err) {
      console.log('delete Subs error: ', err)
    }
    res.json({success: 'disabled'});   
  }
});

app.post('/favorites', function(req, res) {
  // Add your code here
  const inputs = req.body;
  let relationAttributes = inputs;
  console.log('relationAttributes: ', relationAttributes);
  let putRelationParams = {
    TableName: config.relationTableName,
    Item: relationAttributes
  }
  dynamodb.put(putRelationParams, (err, data) => {
    if(err) {
      console.log('relation db put error: ', err);
      res.json({error: err});
    } else{
      console.log('relation db put success');
      res.json({success: 'relation add success'});
    }
  });
});

app.post('/mservices', async function(req, res) {
  // Add your code here
  console.log("test 2nd phase")
  const inputs = req.body
  const functionName = inputs.ServiceName;
  const destDir = '/tmp/' + inputs.UserId + '/' + inputs.ServiceName
  let runtime_extension = 'js'
  if (inputs.ServiceRuntime.includes('nodejs')) {
    runtime_extension = 'js'
  } else {
    runtime_extension = 'py'
  }
  const filesToPack  = ['./' + runtime_extension + '-template/**'];

  // mkdir recursively synchronously
  try {
    fs.mkdirpSync(destDir)
  } catch(e) {
    throw e;
  }
  let s3 = new aws.S3()
  let statusData = null
  try { // taking chance to check and add for public access 
    // let s3 = new aws.S3({params: {Bucket: config.mserviceS3bucketName}, region: config.region}); 
    statusData = await s3.getBucketPolicyStatus({
      Bucket: config.mserviceS3bucketName /* required */
    }).promise()
  } catch (err) {
    console.error('add bucket public error: ', err)
  }
  if (statusData === null || (statusData !== null && statusData.IsPublic === false)) {
    console.log('set bucket/public/share to public ')
    await s3.putBucketPolicy({
      Bucket: config.mserviceS3bucketName, 
      Policy: "{\"Version\": \"2012-10-17\", \"Statement\": [{ \"Sid\": \"allowPublicRead\",\"Effect\": \"Allow\",\"Principal\": {\"AWS\": \"*\"}, \"Action\": \"s3:GetObject\", \"Resource\": \"arn:aws:s3:::" +  config.mserviceS3bucketName + "/public/share/*\" } ]}"
    }).promise().catch(err => {
      console.error('putBucketPolicy error: ', err)
    })
  }
  // Write code string to a handler file
  if (inputs.hasOwnProperty('CodeEntryType') && inputs.CodeEntryType === 'zip') {
    // if the source is from a zip file
    // then, copy it to /tmp folder, and unzip it.
    try {
      let objData = await s3.getObject({
        Bucket: config.mserviceS3bucketName,
        Key: 'public/' + inputs.CodeFileName,
      }).promise()
      //write the zip file locally in a tmp dir
      let tmpZipFilename = '/tmp/' + md5(dateTime({showMilliseconds: true})) + '.zip';
      fs.writeFileSync(tmpZipFilename, objData.Body);
      //check that file in that location is a zip content type, otherwise throw error and exit
      if (mime.lookup(tmpZipFilename) !== "application/zip") {
        fs.unlinkSync(tmpZipFilename);
        res.json({error: 'uploaded file is not of type zip.'})
        return;
      }
      //find all files in the zip and the count of them
      var zip = new AdmZip(tmpZipFilename);
      var zipEntries = zip.getEntries();
      var zipEntryCount = Object.keys(zipEntries).length;

      //if no files found in the zip
      if (zipEntryCount === 0){
        fs.unlinkSync(tmpZipFilename);
        res.json({error: 'the zip file was empty'})
        return
      }
      zip.extractAllTo(destDir, /*overwrite*/true);
      fs.unlinkSync(tmpZipFilename);
    } catch (err) {
      console.log('during zip extract: ', err)
      res.json({error: err})
      return
    }
  } else {
    if (inputs.ServiceRuntime.search(/nodejs/i) !== -1) {
      fs.writeFileSync(destDir + '/main.js', inputs.ServiceCode);
    } else if (inputs.ServiceRuntime.search(/python/i) !== -1) {
      fs.writeFileSync(destDir + '/main.py', inputs.ServiceCode);
    }
  }

  const outputZipName = inputs.ServiceName + ".zip"

  // ----------------------------
  // -- gulp tasks definitions --
  // ---------------------------- 

  // Create an archive folder and add the project files
  gulp.task('copy-language-template', function () {
    console.log('copy-language-template')
    return gulp.src(filesToPack)
      .pipe(gulp.dest(destDir));
  });
  
  gulp.task('template-update-mservice-name', function () {
    console.log('template-update-mservice-name')
    let gulpStream = gulp.src(['./js-template/package.json'])
    if (inputs.ServiceRuntime.includes('nodejs')) {
      return gulpStream.pipe(gulpReplace('mserviceName', inputs.ServiceName))
        .pipe(gulp.dest(destDir));
    } else {
      return gulpStream
    }
  });

  gulp.task('template-update-handler-name', function () {
    console.log('template-update-handler-name')
    let moduleName = 'main'
    let handlerName = 'handler'
    let mainHandlerModule = './js-template/mservice_main.js'
    if (inputs.ServiceRuntime.includes('python')) {
      mainHandlerModule = './py-template/mservice_main.py'
    }
    if (inputs.hasOwnProperty('CodeEntryType') && 
        inputs.CodeEntryType === 'zip' &&
        inputs.hasOwnProperty('CodeHandler')   ) {
      moduleName = inputs.CodeHandler.split('.')[0]
      handlerName = inputs.CodeHandler.split('.')[1]
    }
    return gulp.src([mainHandlerModule])
      .pipe(gulpReplace('__main__', moduleName))
      .pipe(gulpReplace('__handler__', handlerName))
      .pipe(gulp.dest(destDir));
  });
  /**
   * This task will copy all the required dependencies to
   * the dist folder.
   */
  // https://www.npmjs.com/package/gulp-install
  // also support pip ...
  gulp.task('install-node-mods', function () {
    console.log('install-node-mods')
    return gulp.src( destDir + '/package.json')
      .pipe(gulpInstall());
  });

  /**
   * Create an archive based on the dest folder.
   */

  gulp.task('zip', function () {
    console.log('zip')
    return gulp.src(destDir + '/**')  // if exclude dist/package.json ['dist/**', '!dist/package.json']
      .pipe(gulpZip(outputZipName))
      .pipe(gulp.dest('/tmp'));
  });

  gulp.task('upload-zip-to-s3', function () {
    console.log('upload-zip-to-s3')
    var s3 = new aws.S3();
    var zipFilePath = '/tmp/' + outputZipName;
    let data = fs.readFileSync(zipFilePath)
    var params = {
        Bucket: config.mserviceS3bucketName,
        Key: 'public/' + outputZipName,
        Body: data
    };
    s3.putObject(params, function(err, data) {
        if (err) console.log('Object upload unsuccessful!');
        else{
          console.log('Object ' + outputZipName + ' was uploaded!');
          gulp.task('create-update-lambda')()
        } 
    });
    // console.log('finished upload-zip-to-s3')
    return true
  });

  /**
   * store source and update database
   */
  gulp.task('create-update-database', function() {
    console.log('create-update-database')
    aws.config.region = config.region;
    let s3 = new aws.S3();
    let sourceFile = inputs.ServiceName + '.src';
    let s3ObjectParams = {
      Body: inputs.ServiceCode,
      Bucket: config.mserviceS3bucketName,
      Key: 'public/' + sourceFile
    };
    console.log('inputs: ', inputs);
    s3.putObject(s3ObjectParams, function (err, data) {
      if (err) console.log('Bucket error: ', err);
      else{
        let msAttributes = inputs
        msAttributes.QueryString = inputs.ServiceName.toLowerCase() + ' ' + inputs.ServiceDesc.toLowerCase() + ' ' + inputs.InputMessageTopic.toLowerCase() + ' ' + inputs.OutputMessageTopic.toLowerCase()
        msAttributes.ServiceCode = sourceFile;
        console.log('msAttributes: ', msAttributes);
        let putItemParams = {
          TableName: config.mserviceTableName,
          Item: msAttributes
        }
        dynamodb.put(putItemParams, (err, data) => {
          if(err) {
            console.log('DynamoDB error: ', err)
          } else{
            console.log('db success')
          }
        });        
      }
    });
    return true;
  }); // create-update-database
  /**
  *  update or create the lambda functon
  */
  gulp.task('create-update-lambda', function() {
    console.log('create-update-lambda')
    try {
      aws.config.region = config.region;
      var lambda = new aws.Lambda();
      var s3 = new aws.S3();
      var zipFile = outputZipName;
      var bucketName = config.mserviceS3bucketName;

      console.log('before getFunction')
      lambda.getFunction({ FunctionName: functionName }, function(err, data) {
        console.log('lambda getFunction')
        if (err) checkObject(createFunction);
        else checkObject(updateFunction);
      });
    } catch (error) {
      console.log('create-update error: ', error)
    }
    function checkObject (fn) {
      console.log('checkObject')
      var params = {
        Bucket: bucketName,
        Key: 'public/' + zipFile
      };
      s3.getObject(params, async function (err, data) {
        if (err) console.log('BUCKET ERROR', err);
        else await fn();
      });
    }
    let funcEnvs = {
      'INPUT_MESSAGE_TOPIC': inputs.InputMessageTopic,
      'OUTPUT_MESSAGE_TOPIC': inputs.OutputMessageTopic,
      'USER_POOL_ID': config.awsUserPoolId,
      'IOT_ENDPOINT': config.awsIotEndpoint,
      'MSERVICE_NAME': inputs.ServiceName,
      'S3_BUCKET': config.mserviceS3bucketName,
      'OWNER_ID': inputs.UserId,
      'OWNER_UNAME': inputs.UserName,
      'REGION': config.region,
      'ACCOUNT_ID': config.awsAccountId,
      'IS_SHARED': inputs.IsShared,
      'USER_DATA_TABLE': config.userDataTable
    }
    function createFunction () {
      console.log('createFunction')
      let fRuntime = inputs.ServiceRuntime
      if (fRuntime === 'nodejs' || fRuntime === 'nodejs8.10') {
        fRuntime = 'nodejs12.x'
        inputs.ServiceRuntime = fRuntime
      } else if (fRuntime === 'python') {
        fRuntime = 'python3.7'
      }
        let isAdminUser = 'false'
        for (let superuser of config.adminUsers) {
          if (superuser === inputs.UserId || superuser === inputs.UserName) {
            isAdminUser = 'true'
            break
          }
        }
        if (isAdminUser === 'true') {
          funcEnvs.SYSTEM_MSERVICE = isAdminUser
        }
        var params = {
          Code: {
            S3Bucket: bucketName,
            S3Key: 'public/' + zipFile
          },
          Description: (inputs.ServiceDesc).substring(0, 255),
          Environment: {
            Variables: funcEnvs
          },
          FunctionName: functionName,
          Handler: ((inputs.ServiceRuntime.search(/nodejs/i) !== -1)  ? "mservice_main.handler" : "mservice_main.handler"),
          Role: config.mserviceRole,
          Runtime: fRuntime,
          Timeout: 15, // default is 3 seconds, max. 900 seconds
          MemorySize: 128 // 128MB, +64 multiples
        };
        lambda.createFunction (params, function (err, data) {
          if (err) console.error("CREATE ERROR", err);
          else{
            console.log('Function ' + functionName + ' has been created.');
            lambda.publishVersion({
              FunctionName: functionName /* required */
            }, function(err, publishVersionData) {
              if (err) console.log(err, err.stack); // an error occurred
              else {
                console.log('createAlias: ', publishVersionData);
                lambda.createAlias({ 
                  FunctionName: functionName, /* required */
                  FunctionVersion: publishVersionData.Version, /* required */
                  Name: functionName + '_Latest', /* required */
                }, function(err, data) {
                  if (err) console.log(err, err.stack); // an error occurred
                  else {
                    console.log('after createAlias');
                    gulp.task('create-iot-rule')();
                  }   
                }) 
              }
            });
          }
        });
    }
    async function updateFunction () {
            console.log('updateFunction')
            let handlerName = 'mservice_main.handler' 
            if (inputs.ServiceRuntime.includes('nodejs') === false) {
              handlerName = 'mservice_main.handler'
            }
            // console.log('updateFunction handlerName: ', handlerName)
            // console.log('updateFunction runtime: ', inputs.ServiceRuntime)
            let fRuntime = inputs.ServiceRuntime
            if (fRuntime === 'nodejs' || fRuntime === 'nodejs8.10') {
              fRuntime = 'nodejs12.x'
              inputs.ServiceRuntime = fRuntime
            } else if (fRuntime === 'python') {
              fRuntime = 'python3.7'
            }
            // console.log('fRuntime ', fRuntime)
            // console.log('inputs ', inputs)
            try {
              /*
              let funcData = await lambda.getFunctionConfiguration({
                FunctionName: functionName
              }).promise()
              let funcEnvs = funcData.Environment.Variables
              funcEnvs.INPUT_MESSAGE_TOPIC = inputs.InputMessageTopic
              funcEnvs.OUTPUT_MESSAGE_TOPIC = inputs.OutputMessageTopic
              funcEnvs.OWNER_ID = inputs.UserId
              funcEnvs.IS_SHARED = inputs.IsShared
              funcEnvs.USER_DATA_TABLE = config.userDataTable
              */
              let isAdminUser = 'false'
              for (let superuser of config.adminUsers) {
                if (superuser === inputs.UserId || superuser === inputs.UserName) {
                  isAdminUser = 'true'
                  break
                }
              }
              if (isAdminUser === 'true') {
                funcEnvs.SYSTEM_MSERVICE = isAdminUser
              } else if (funcEnvs.hasOwnProperty('SYSTEM_MSERVICE')) {
                delete funcEnvs.SYSTEM_MSERVICE
              }
              // 2019/12/24 revise to use 'sub field as user id, instead of user name
              // still leave user name as part of env variable.
              if (funcEnvs.hasOwnProperty('OWNER_UNAME') === false) {
                funcEnvs.OWNER_UNAME = inputs.UserName
              }
              console.log('funcEnvs: ', funcEnvs)
              await lambda.updateFunctionConfiguration( {
                FunctionName: functionName, /* required */
                Description: (inputs.ServiceDesc).substring(0, 255),
                Environment: {
                  Variables: funcEnvs
                },
                Handler: handlerName,
                Runtime: fRuntime
              }).promise()
              await lambda.updateFunctionCode({
                FunctionName: functionName,
                S3Bucket: bucketName,
                S3Key: 'public/' + zipFile
              }).promise()
              let publishVersionData = await lambda.publishVersion({
                FunctionName: functionName /* required */
              }).promise()
              let aliasName = functionName + '_Latest'
              let updateAliasPromise = lambda.updateAlias({ 
                FunctionName: functionName, /* required */
                FunctionVersion: publishVersionData.Version, /* required */
                Name: aliasName /* required */
              }).promise()
              await updateAliasPromise.catch( async function (err) { 
                console.log('updateFunction addPermission error: ', err) // an error occurred
                await lambda.createAlias({
                  FunctionName: functionName, /* required */
                  FunctionVersion: publishVersionData.Version, /* required */
                  Name: aliasName /* required */
                }).promise()
              })
              gulp.task('create-iot-rule')();
            } catch (err) {
              console.log('updateFunction error: ', err)
            }
    }
    return true
  }); // create-update-lambda
  
  gulp.task('test-invoke', function() {
    console.log('test-invoke')
    var lambda = new aws.Lambda();
  
    var params = {
      FunctionName: functionName,
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: '{ "key1" : "name" }'
    };
  
    lambda.getFunction({ FunctionName: functionName }, function(err, data) {
      if (err) console.log("Function" + functionName +  "not found", err);
      else invokeFunction();
    });
  
    function invokeFunction() {
      lambda.invoke(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      })
    }
  });

  gulp.task('create-iot-rule', function () {
    console.log('create-iot-rule');
    aws.config.region = config.region;
    let lambda = new aws.Lambda();
    let params = {
      FunctionName: functionName
    };
    lambda.getFunction(params, async function(err, data) {
       if (err) console.log(err); // an error occurred
       else {
          // --
          var addPermissionParams = {
            Action: "lambda:InvokeFunction", 
            FunctionName: functionName, 
            Principal: "iot.amazonaws.com", 
            StatementId: functionName + "_perm_invoke"
          };
          let addPermissionPromise = lambda.addPermission(addPermissionParams).promise()
          await addPermissionPromise.catch( function (err) { 
            console.log('addPermission: warning: ', err); // an error occurred
          });
          // await addPermissionPromise
          // console.log('after add permission: ', data);
          let iot = new aws.Iot();
          let theFunctionArn = data.Configuration.FunctionArn;
          let iotTopicRuleName = inputs.UserId.replace(/\-/g, '_') + '_' + inputs.ServiceName + '_rule';
          let params = {
            ruleName: iotTopicRuleName /* required */
          };
          console.log('getTopicRule: ', iotTopicRuleName, ': ', theFunctionArn);
          iot.getTopicRule(params, function(err, data) {
            /* For public shared case
              No need to any any WHERE clouse
            */
            /* For private case
               either sent from user himself or sent from (the microservice owner and the microservice is shared)
              'WHERE mserviceOwnerId = ' + inputs.UserId +
              ' OR mserviceOwnerId = topic(2)'
            */
            let whereClouse = ''
            let allowedTopicHeader =  ''

            if (inputs.IsShared === 'true') { // public shared
              // allow triggered by all microservices
              allowedTopicHeader = 'aiot/+/' // 'aiot/' + inputs.UserId + '/'
            } else {  // private
              // only allow triggered by input messages sent from 
              // 1. the user himself
              // 2. or the users own the shared microservices
              // 3. from system user 'admin' or 'system'
              allowedTopicHeader =  'aiot/+/'
              whereClouse = 'WHERE topic(2) = \'system\' OR topic(2) = \'admin\' OR topic(2) = \'' + inputs.UserId + '\' OR mserviceOwnerId = topic(2)'
            }
            if (inputs.hasOwnProperty('InputMicroservice') && inputs.InputMicroservice !== '') {
              allowedTopicHeader =  allowedTopicHeader + inputs.InputMicroservice + '/' 
            } else {
              allowedTopicHeader =  allowedTopicHeader + '+/' 
            }
            let iotTopicRuleParams = {
              ruleName: iotTopicRuleName, /* required */
              topicRulePayload: { /* required */
                actions: [ /* required */
                  {
                    lambda: {
                      functionArn: theFunctionArn /* required */
                    }
                  }
                ],
                sql: "SELECT *, topic() AS topic, topic(2) AS sender, topic(3) AS fromWhere FROM '" + allowedTopicHeader + inputs.InputMessageTopic + "'" + whereClouse, /* required */
                // , topic() AS MessageTopic
                ruleDisabled: false,
                awsIotSqlVersion: '2016-03-23'
              }
            };
            if (err){
              if (inputs.InputMessageTopic === 'null') {
                // bypass creating iot topic rule,
                gulp.task('version-update-return')()
                return                  
              }
              console.log('createTopicRule: ', iotTopicRuleParams);
              iot.createTopicRule(iotTopicRuleParams, function(err, data) {
                if (err) console.log(err); // an error occurred
                else{
                  gulp.task('version-update-return')();            
                }
              });  
            }
            else{
              if (inputs.InputMessageTopic === 'null') {
                iot.deleteTopicRule({
                  ruleName: iotTopicRuleName, /* required */
                }, function(err, data) {
                  if (err){
                    console.log('deleteTopicRule error: ', err);
                  }else{
                    gulp.task('version-update-return')();     
                   }
                }); // end deleteTopicRule
                // bypass creating iot topic rule,
                return
              }
              console.log('replaceTopicRule: ', iotTopicRuleParams);
              iot.replaceTopicRule(iotTopicRuleParams, function(err, data) {
                if (err) console.log(err); // an error occurred
                else{
                  gulp.task('version-update-return')();     
                }
              });  
            }
          }); // end getTopicRule

      } // if without error
    }); // end lambda getFunction
    return true
  }); // end task create-iot-rule

  gulp.task('version-update-return', function () {
    console.log('version-update-return');
    let lambda = new aws.Lambda();
    lambda.getAlias({
      FunctionName: inputs.ServiceName, /* required */
      Name: inputs.ServiceName + '_Latest'  // Alias name
    }, function(err, lambdaData) {
      if (err){
        console.log(err, err.stack); // an error occurred
      } else {
        let functionArn = lambdaData.AliasArn       
        dynamodb.update({
          TableName: config.mserviceTableName,
          Key:{
            'ServiceName': inputs.ServiceName,
          },
          UpdateExpression: 'set ServiceArn = :serviceArn',
          ExpressionAttributeValues:{
            ':serviceArn': functionArn
          },
          ReturnValues:'ALL_NEW'
        }, (err, dbData) => {
          if(err) {
            console.log('DynamoDB put error: ', err)
          } else{
            res.json({success: 'microservice updated', microservice: dbData})
          }
        })
      }
    })           
  });

  // gulp by default uses the default task to execute 
  // when you type $ gulp in the command line.

  gulp.task('deploy-lambda', gulp.series(
    'copy-language-template',
    'template-update-handler-name',
    'template-update-mservice-name',
    // 'install-node-mods', // run parallelly?
    'zip',
    'upload-zip-to-s3',
    // ,
    // 'create-update-lambda', 
    function () {
       console.log('deploy start');
       // callback();
       res.json({success: 'post call succeed!', url: req.url, body: req.body})
    }
  ));
  // ------------------
  // -- continued .. main routine --
  // ------------------
  let params = {};
  partitionKeyName = 'ServiceName'
  params[partitionKeyName] = inputs.ServiceName
  let getItemParams = {
    TableName: config.mserviceTableName,
    Key: params
  }
  let fRuntime = inputs.ServiceRuntime
  if (fRuntime === 'nodejs' || fRuntime === 'nodejs8.10') {
    fRuntime = 'nodejs12.x'
    inputs.ServiceRuntime = fRuntime
  } else if (fRuntime === 'python') {
    fRuntime = 'python3.7'
    inputs.ServiceRuntime = fRuntime
  }
  // check if the mservice exists and if yes, check the ownership
  dynamodb.get(getItemParams, (err, data) => {
    let isCreateUpdate = true;
    if (err) {  // not found, means a new mservice
      isCreateUpdate = true;
    } else if (typeof data.Item === 'undefined') {
      isCreateUpdate = true;
    } else {
      let mserviceItem = data.Item
      try{
        if (mserviceItem.UserId !== inputs.UserId) { // is not owned by the user
          console.log('start create and updates');
          res.json({error: 'service name is already used by others.'});
          isCreateUpdate = false;
         }else { // if owned by this user
          isCreateUpdate = true;
        }
      }catch (e) {
        isCreateUpdate = true;
      }
    }
    if (isCreateUpdate) {
      console.log('start create and updates');
      gulp.task('create-update-database')();
      gulp.task('deploy-lambda')();
    } else {
      // end of the routine
    }
  }) // dynamodb.get
  
});

app.post('/mservices/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example post method *
****************************/

app.put('/mservices', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/mservices/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/favorites', function(req, res) {
  // Add your code here
  let event = req.apiGateway.event;
  let query = event.queryStringParameters;
  let params = {};
  params['UserId'] = query.userId;
  params['ServiceName'] = query.serviceName;
  let deleteRelationParams = {
    TableName: config.relationTableName,
    Key: params
  };
  console.log('relation db delete params: ', deleteRelationParams);
  dynamodb.delete(deleteRelationParams, (err, data) => {
    if (err) {
      console.log('relation db delete error: ', err);
      res.json({error: err});
    } else {
      console.log('relation delete success');
      res.json({success: 'successfully deleted'});
    }
  });
});

app.delete('/mservices', function(req, res) {
  // Add your code here
  let event = req.apiGateway.event;
  let query = event.queryStringParameters;
  const functionName = query.mserviceName;
  const outputZipName = query.mserviceName + ".zip"
  const userId = query.userId

  let params = {};
  const partitionKeyName = "ServiceName";
  params[partitionKeyName] = query.mserviceName;
  let deleteItemParams = {
    TableName: config.mserviceTableName,
    Key: params
  };
  console.log('db delete params: ', deleteItemParams);
  dynamodb.delete(deleteItemParams, (err, data)=> {
    if(err) {
      console.log('db delete error: ', err);
      res.json({error: err, url: req.url});
    } else {
      console.log('start gulp delete task');
      gulp.task('delete-iot-rule')();
    }
  });

  /**
    *  delete the lambda functon
    */
  gulp.task('delete-lambda', function() {
    console.log('delete-lambda')
    aws.config.region = config.region;
    var lambda = new aws.Lambda();
    var s3 = new aws.S3();
    var zipFile = outputZipName;
    var bucketName = config.mserviceS3bucketName;

    console.log('before getFunction')
    lambda.getFunction({ FunctionName: functionName }, function(err, data) {
      console.log('lambda getFunction')
      if (err) {
        console.log(err)
        res.json({error: err})
      } else {
        deleteObject(deleteFunction)
      }
    });

    function deleteObject (continueFn) {
      console.log('checkObject')
      var params = {
        Bucket: bucketName,
        Key: 'public/' + zipFile
      };
      s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log('BUCKET ERROR', err)
          res.json({error: err})
        } else {
          continueFn()
        }
      });
    }

    function deleteFunction () {
      console.log('deleteFunction')
      lambda.deleteAlias( {
        FunctionName: functionName,
        Name: functionName + '_Latest'
      }, function(err, data) {
        if (err){
          console.log(err, err.stack); // an error occurred
          res.json({error: err})
        } else {
          lambda.deleteFunction({
            FunctionName: functionName 
            // Qualifier: "1" // delete only a version
          }, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              res.json({error: err})
            } else {
              console.log('Function ' + functionName + ' has been deleted.')
              res.json({error: null})
            }
         });
        }     
      });
    } // end of deleteFunction
  }); // end gulp delete-lambda

  gulp.task('delete-iot-rule', function () {
    console.log('delete-iot-rule');
    aws.config.region = config.region;
    let lambda = new aws.Lambda();
    let params = {
      FunctionName: functionName
    };
    lambda.getFunction(params, function(err, data) {
       if (err) console.log(err); // an error occurred
       else {
          // console.log('found function: ', data);
          let iot = new aws.Iot();
          let theFunctionArn = data.Configuration.FunctionArn;
          let iotTopicRuleName = userId.replace(/\-/g, '_') + '_' + functionName + '_rule';
          let params = {
            ruleName: iotTopicRuleName /* required */
          };
          iot.deleteTopicRule(params, function(err, data) {
            if (err){
              // the rule may not exist
              console.log('warn: deleteTopicRule: ', err);
            }else{
            }
            gulp.task('delete-lambda')();
          }); // end deleteTopicRule

      } // if without error
    }); // end lambda getFunction
    return true
  }); // end task delete-iot-rule

}); // end delete mservice

app.delete('/mservices/*', function(req, res) {
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
