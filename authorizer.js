const { CognitoJwtVerifier } = require("aws-jwt-verify");
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_USER_POOL_CLIENT = process.env.COGNITO_USER_POOL_CLIENT;

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "id",
  clientId: COGNITO_USER_POOL_CLIENT,
});

const generatePolicy = (principalId, effect, resource) => {
  var tmp = resource.split(":");
  var apiGatewayArnTmp = tmp[5].split("/");

  // Create wildcard resource
  var resource =
    tmp[0] +
    ":" +
    tmp[1] +
    ":" +
    tmp[2] +
    ":" +
    tmp[3] +
    ":" +
    tmp[4] +
    ":" +
    apiGatewayArnTmp[0] +
    "/*/*";

  var authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Resource: resource,
          Action: "execute-api:Invoke",
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }
  authResponse.context = {
    foo: "bar",
  };
  console.log(JSON.stringify(authResponse));
  return authResponse;
};

exports.handler = async (event, context, callback) => {
  // lambda authorizer code
  var token = event.authorizationToken;

  //Validate Token
  try {
    const payload = await jwtVerifier.verify(token);
    console.log(JSON.stringify(payload));
    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch (err) {
    callback("Error: Invalid Token");
  }

  // "allow" or "deny" - Mock example
  /* switch (token) {
    case "allow":
      callback(null, generatePolicy("user", "Allow", event.methodArn));
      break;
    case "deny":
      callback(null, generatePolicy("user", "Deny", event.methodArn));
      break;
    default:
      callback("Error: Invalid token"); */
};
