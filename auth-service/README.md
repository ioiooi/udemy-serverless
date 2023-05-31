# Auth Service in TypeScript

https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html

Using sample `tsconfig.json` and `serverless-bundle` plugin to create custom TS stack.

## Notes: Move from JavaScript to TypeScript

- `auction-service` is using ApiGatewayV2 lambdas versus V1 which are used here. That makes a difference and so the `event` can be either of Type `APIGatewayTokenAuthorizerEvent` or `APIGatewayRequestAuthorizerEventV2`. That leads to checks that wouldnt be necessary if the authorizer be always called from either `http` or `httpApi`.
- Use `Pick` to only select a subset from `APIGatewayAuthorizerResult`

## Links

https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html

https://stackoverflow.com/a/5515349/5663191

https://github.com/AnomalyInnovations/serverless-bundle/issues/124
