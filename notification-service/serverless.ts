import type { AWS } from "@serverless/typescript";

import sendMail from "@functions/sendMail";

const serverlessConfiguration: AWS = {
  service: "notification-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    memorySize: 256,
    stage: '${opt:stage, "dev"}',
    region: "eu-central-1",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["sqs:ReceiveMessage"],
        Resource: "${self:custom.mailQueue.arn}",
      },
      {
        Effect: "Allow",
        Action: ["ses:SendEmail"],
        Resource: "arn:aws:ses:*",
      },
    ],
  },
  resources: {
    Resources: {
      MailQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:custom.mailQueue.name}",
        },
      },
    },
    Outputs: {
      MailQueueArn: {
        Value: "${self:custom.mailQueue.arn}",
        Export: {
          Name: "${self:custom.mailQueue.name}-Arn",
        },
      },
      MailQueueUrl: {
        Value: "${self:custom.mailQueue.url}",
        Export: {
          Name: "${self:custom.mailQueue.name}-Url",
        },
      },
    },
  },
  // import the function via paths
  functions: { sendMail },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node18",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    mailQueue: {
      name: "MailQueue-${sls:stage}",
      arn: { "Fn::GetAtt": ["MailQueue", "Arn"] },
      url: { Ref: "MailQueue" },
    },
  },
};

module.exports = serverlessConfiguration;
