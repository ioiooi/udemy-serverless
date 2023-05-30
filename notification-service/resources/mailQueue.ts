const mailQueueResource = {
  MailQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      QueueName: "${self:custom.mailQueue.name}",
    },
  },
};

const mailQueueOutputs = {
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
};

export { mailQueueResource, mailQueueOutputs };
