import {
  APIGatewayAuthorizerResult,
  APIGatewayAuthorizerResultContext,
  APIGatewayRequestAuthorizerEventV2,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import jwt from "jsonwebtoken";

const getPolicyResource = (
  event: APIGatewayTokenAuthorizerEvent | APIGatewayRequestAuthorizerEventV2
): string | null => {
  if (event.type === "TOKEN") {
    return event.methodArn.split("/", 2).join("/") + "/*";
  }

  if (event.type === "REQUEST") {
    return event.routeArn;
  }

  return null;
};

const getToken = (
  event: APIGatewayTokenAuthorizerEvent | APIGatewayRequestAuthorizerEventV2
): string | null => {
  if (event.type === "TOKEN") {
    if (!event.authorizationToken) {
      throw "Unauthorized";
    }

    return event.authorizationToken.replace("Bearer ", "");
  }

  if (event.type === "REQUEST") {
    if (!event.headers?.authorization) {
      throw "Unauthorized";
    }

    return event.headers.authorization.replace("Bearer ", "");
  }

  return null;
};

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (
  principalId: string,
  resource: string
): Pick<APIGatewayAuthorizerResult, "principalId" | "policyDocument"> => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: resource,
        },
      ],
    },
  };
};

export async function handler(
  event: APIGatewayTokenAuthorizerEvent | APIGatewayRequestAuthorizerEventV2
): Promise<APIGatewayAuthorizerResult> {
  console.log(event);

  const token = getToken(event);
  const policyResource = getPolicyResource(event);

  try {
    if (!token) {
      throw new Error("Token is missing!");
    }

    if (!policyResource) {
      throw new Error("Policy resource is missing!");
    }

    if (!process.env.AUTH0_PUBLIC_KEY) {
      throw new Error("Auth0 public key is missing!");
    }

    const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);

    if (!claims.sub) {
      throw new Error("JwtPayload sub is missing!");
    }

    const policy = generatePolicy(claims.sub.toString(), policyResource);

    return {
      ...policy,
      context: claims as APIGatewayAuthorizerResultContext,
    };
  } catch (error) {
    console.log(error);
    throw "Unauthorized";
  }
}
