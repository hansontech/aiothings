/* eslint-disable */
// WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

const awsmobile = {
    "aws_project_region": "ap-southeast-2",
    "aws_cognito_identity_pool_id": "ap-southeast-2:3d7b03ba-23cc-4892-83cf-1084e3cc6a2c",
    "aws_cognito_region": "ap-southeast-2",
    "aws_user_pools_id": "ap-southeast-2_GETSSHigP",
    "aws_user_pools_web_client_id": "1gsvaos6ahp3brb6899dqput0m",
    "oauth": {
        "domain": "aiothings0528-prod.auth.ap-southeast-2.amazoncognito.com",
        "scope": [
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "https://www.aiothings.com/callback/",
        "redirectSignOut": "https://www.aiothings.com/signout/",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_AND_IDENTITY_POOLS",
    "aws_content_delivery_bucket": "aiothings-20190217143527-hostingbucket-prod",
    "aws_content_delivery_bucket_region": "ap-southeast-2",
    "aws_content_delivery_url": "https://ddhnii0hf5ke.cloudfront.net",
    "aws_user_files_s3_bucket": "aiot-bucket-prod",
    "aws_user_files_s3_bucket_region": "ap-southeast-2",
    "aws_cloud_logic_custom": [
        {
            "name": "thingApi",
            "endpoint": "https://vx1xuy1ns4.execute-api.ap-southeast-2.amazonaws.com/prod",
            "region": "ap-southeast-2"
        },
        {
            "name": "mserviceApi",
            "endpoint": "https://3bb7hxew9g.execute-api.ap-southeast-2.amazonaws.com/prod",
            "region": "ap-southeast-2"
        },
        {
            "name": "userApi",
            "endpoint": "https://7709s8s2n6.execute-api.ap-southeast-2.amazonaws.com/prod",
            "region": "ap-southeast-2"
        },
        {
            "name": "apiApi",
            "endpoint": "https://2dlkdca3ud.execute-api.ap-southeast-2.amazonaws.com/prod",
            "region": "ap-southeast-2"
        }
    ]
};


export default awsmobile;
