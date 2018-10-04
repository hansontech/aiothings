/*
  Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except
  in compliance with the License. A copy of the License is located at

      http://aws.amazon.com/apache2.0/

  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import config from './config.json'
import awsexports from '../aws-exports'

export default {
  awsIotHost: config.AwsIotHost,
  awsRegion: config.AwsRegion,
  awsCognitoDomain: 'aiotest.auth.ap-southeast-2.amazoncognito.com',
  awsCognitoUserPoolId: awsexports.aws_user_pools_id,
  awsCognitoUserPoolAppClientId: awsexports.aws_user_pools_web_client_id,
  awsCognitoIdentityPoolId: config.IdentityPoolId,
  awsApiGatewayInvokeUrl: config.AwsApiGatewayInvokeUrl,
  socialFacebookAppId: config.FacebookAppId,
  socialGoogleClientId: config.GoogleAppId,
  logLevel: config.LogLevel,
  mqttDebugLevel: config.MqttDebugLevel,
};
