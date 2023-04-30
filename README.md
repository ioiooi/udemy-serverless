# udemy-serverless

https://www.udemy.com/course/serverless-framework/

## Project Overview

![](docs/images/project-overview.png)

## Commands

### Deploying

https://www.serverless.com/framework/docs/providers/aws/guide/deploying

Deploying a service aka a project or application

```
npm run deploy
```

Deploying a function after some code changes

```
npm run deploy:func createAuction
```

### Removing

https://www.serverless.com/framework/docs/providers/aws/cli-reference/remove

Stack removal / take down application

```
npm run remove
```

## URL 

Getting the URL of the auction service in order to hit the lambdas.

Open the Resources Tab of the CloudFormation Stack. Look for the Logical ID `HttpApi` or the Type `AWS::ApiGatewayV2::Api`. Use the link to open the ApiGateway resource. The Invoke URL is the URL of the service endpoint.

![](docs/images/url_1_cloudformation.PNG)

![](docs/images/url_2_apigateway.PNG)