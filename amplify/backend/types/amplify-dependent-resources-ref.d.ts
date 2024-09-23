export type AmplifyDependentResourcesAttributes = {
  "api": {
    "apiApi": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    },
    "mserviceApi": {
      "ApiName": "string",
      "RootUrl": "string"
    },
    "thingApi": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    },
    "userApi": {
      "ApiName": "string",
      "RootUrl": "string"
    }
  },
  "auth": {
    "aiotAuth": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "AppClientSecret": "string",
      "FacebookWebClient": "string",
      "GoogleWebClient": "string",
      "HostedUIDomain": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "OAuthMetadata": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    }
  },
  "function": {
    "aiotSignupChecker": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "apiAuthorizerFunction": {
      "Arn": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "apiFunction": {
      "Arn": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "jobFunction": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "mserviceFunction": {
      "Arn": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "solutionFunction": {
      "Arn": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "thingFunction": {
      "Arn": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "userFunction": {
      "Arn": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "hosting": {
    "S3AndCloudFront": {
      "CloudFrontDistributionID": "string",
      "CloudFrontDomainName": "string",
      "CloudFrontSecureURL": "string",
      "HostingBucketName": "string",
      "Region": "string",
      "S3BucketSecureURL": "string",
      "WebsiteURL": "string"
    }
  },
  "storage": {
    "aiotStorage": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}