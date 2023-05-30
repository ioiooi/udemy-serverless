import type { AWS } from "@serverless/typescript";

import mailQueueIAM from "iam/mailQueueIAM";
import sendMailIAM from "iam/sendMailIAM";
import { mailQueueResource, mailQueueOutputs } from "resources/mailQueue";
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
    iamRoleStatements: [mailQueueIAM, sendMailIAM],
  },
  resources: {
    Resources: {
      ...mailQueueResource,
    },
    Outputs: {
      ...mailQueueOutputs,
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
