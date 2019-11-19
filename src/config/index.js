/*
  Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except
  in compliance with the License. A copy of the License is located at

      http://aws.amazon.com/apache2.0/

  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import awsexports from '../aws-exports'

export default {
  awsIotHost: "a3vgppxo7lddg8-ats.iot.ap-southeast-2.amazonaws.com",
  awsRegion: awsexports.aws_project_region,
  awsGreengrassBucket: awsexports.aws_user_files_s3_bucket, // 'aiot-bucket',
  awsCognitoUserPoolId: awsexports.aws_user_pools_id,
  awsCognitoUserPoolAppClientId: awsexports.aws_user_pools_web_client_id,
  amplifyEnvironment: awsexports.aws_content_delivery_bucket.substring(awsexports.aws_content_delivery_bucket.lastIndexOf('-')),
};
