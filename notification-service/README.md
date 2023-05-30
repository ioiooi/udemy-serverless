# Notification Service in TypeScript

https://www.serverless.com/framework/docs/providers/aws/cli-reference/create

Use existing `aws-nodejs-typescript` template as base.

## Notes: Move from javascript and yml to TS

- Serverless variables like `${sls:stage}` or `${self:custom.Foo.Bar}` can still (and easily) be used
- Custom mailQueue variables had to be rewritten because just wrapping GetAtt or Ref functions in quotes didn't work

Before:

```yml
mailQueue:
  name: MailQueue-${self:provider.stage}
  arn: !GetAtt MailQueue.Arn
  url: !Ref MailQueue
```

After:

```ts
mailQueue: {
  name: "MailQueue-${sls:stage}",
  arn: { "Fn::GetAtt": ["MailQueue", "Arn"] },
  url: { Ref: "MailQueue" }
}
```

- Lambda config like which events the function is triggered by are moved into the function folder. See `./src/functions/sendMail/index.ts`.

## Links

https://github.com/andrenbrandao/serverless-typescript-boilerplate/blob/main/serverless.ts
https://github.com/mamezou-tech/serverless-example-typescript/blob/main/serverless.ts
https://forum.serverless.com/t/reference-aws-arn-in-serverless-ts-file/12192
