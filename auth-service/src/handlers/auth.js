import jwt from "jsonwebtoken";

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (principalId, event) => {
  const resource =
    event.routeArn ?? event.methodArn.split("/", 2).join("/") + "/*";

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

const apiGatewayV1 = (event) => {
  if (!event.authorizationToken) {
    throw "Unauthorized";
  }

  const token = event.authorizationToken.replace("Bearer ", "");

  return token;
};

const apiGatewayV2 = (event) => {
  if (!event.headers.authorization) {
    throw "Unauthorized";
  }

  const token = event.headers.authorization.replace("Bearer ", "");

  return token;
};

export async function handler(event, context) {
  console.log(event);
  let token;

  if (event.type === "TOKEN") {
    token = apiGatewayV1(event);
  }

  if (event.type === "REQUEST") {
    token = apiGatewayV2(event);
  }

  try {
    const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
    const policy = generatePolicy(claims.sub, event);

    return {
      ...policy,
      context: claims,
    };
  } catch (error) {
    console.log(error);
    throw "Unauthorized";
  }
}
