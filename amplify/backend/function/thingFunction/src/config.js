// import Lambda Environment variables
// var environment = process.env;
var environment = {"DynamoDB_TABLE_NAME":"atThingTable","REGION":"ap-southeast-2"}
// Table name var 
var config = {
    DynamoDB_TABLE_NAME: environment.DynamoDB_TABLE_NAME,
    DYNAMODB_TABLE_REGION: environment.REGION,
    region: environment.REGION
};


// In actual production, the policy document should be generated dynamically.
config.POLICY_DOCUMENT = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [ "iot:*", "greengrass:*" ],
      "Resource": "*"
    }
  ]
}
`;

// ATS
config.RootCA_URL = "https://www.amazontrust.com/repository/AmazonRootCA1.pem"
// VeriSign Class 3 Public Primary G5 root CA certificateVeriSign Class 3 Public Primary G5 root CA certificate
// Deprecated, no more valid 'https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem';

module.exports = config;