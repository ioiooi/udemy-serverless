import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sqs = new SQSClient({ region: "eu-central-1" });

export async function closeAuction(auction) {
  const closeAuctionsInput = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ReturnValues: "ALL_NEW",
  };

  const closeAuctionsCommand = new UpdateCommand(closeAuctionsInput);
  await docClient.send(closeAuctionsCommand);

  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  if (amount === 0) {
    const input = {
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "No bids on your auction item :(",
        recipient: seller,
        body: `Oh no! Your item "${title}" didn't get any bids. Better luck next time!`,
      }),
    };
    const command = new SendMessageCommand(input);
    await sqs.send(command);

    return;
  }

  const notifySellerInput = {
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: "Your item has been sold!",
      recipient: seller,
      body: `Woohoo! Your itme "${title}" has been sold for $${amount}.`,
    }),
  };
  const notifySellerCommand = new SendMessageCommand(notifySellerInput);
  const notifySeller = sqs.send(notifySellerCommand);

  const notifyBidderInput = {
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: "You won an auction!",
      recipient: bidder,
      body: `What a great deal! You got yourself a "${title}" for $${amount}.`,
    }),
  };
  const notifyBidderCommand = new SendMessageCommand(notifyBidderInput);
  const notifyBidder = sqs.send(notifyBidderCommand);

  return Promise.all([notifySeller, notifyBidder]);
}
