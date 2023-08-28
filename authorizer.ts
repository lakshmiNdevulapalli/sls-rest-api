import {
  APIGatewayTokenAuthorizerEvent,
  Context,
  AuthResponse,
} from "aws-lambda";
import { Effect } from "aws-sdk/clients/lexmodelsv2";

const { CognitoJwtVerifier } = require("aws-jwt-verify");
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_USER_POOL_CLIENT = process.env.COGNITO_USER_POOL_CLIENT;

console.log("COGNITO_USER_POOL_ID:", process.env.COGNITO_USERPOOL_ID);
console.log("COGNITO_USER_POOL_CLIENT:", process.env.COGNITO_USER_POOL_CLIENT);

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "id",
  clientId: COGNITO_USER_POOL_CLIENT,
});

const generatePolicy = (
  principalId: string,
  effect: Effect,
  resource: string
): AuthResponse => {
  let tmp: string[] = resource.split(":");
  let apiGatewayArnTmp: string[] = tmp[5].split("/");

  // Create wildcard resource
  resource =
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

  let authResponse = {} as AuthResponse;

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
  console.log();
  return authResponse;
};

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
  callback: any
) => {
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

  //temp auth
  // "allow" or "deny" - Mock example for test
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
