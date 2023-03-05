import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function createAuction(event, context) {
  const { title } = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
  };

  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  };

  const command = new PutCommand(input);
  const response = await docClient.send(command);

  return {
    statusCode: 201,
    body: JSON.stringify(auction, response),
  };
}

export const handler = createAuction;
