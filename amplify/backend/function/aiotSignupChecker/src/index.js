
exports.handler = (event, context, callback) => {

  console.log('event: ', event)
  let error = null
  
  if (event.hasOwnProperty("userName")) {
      console.log('into the UserName')
      let userName = event.userName 
      let letters = /^[0-9a-zA-Z\-\_.]+$/
      if (letters.test(userName) === false) {
          console.log('error happens')
          error = 'Not a valid user name format'
      } else if (userName === 'admin') {
          error = 'User name cannot be \'admin\''
      }
  }
  console.log('event: ', event)
  // Confirm the user
  // event.response.autoConfirmUser = true;

  // Set the email as verified if it is in the request
  // if (event.request.userAttributes.hasOwnProperty("email")) {
  //     event.response.autoVerifyEmail = false;
  // }

  // Set the phone number as verified if it is in the request
  // if (event.request.userAttributes.hasOwnProperty("phone_number")) {
  //     event.response.autoVerifyPhone = true;
  // }

  // Return to Amazon Cognito
  callback(error, event);
};
