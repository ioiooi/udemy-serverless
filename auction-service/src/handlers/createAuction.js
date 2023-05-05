import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  };

  const command = new PutCommand(input);

  try {
    await docClient.send(command);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction).use(
  validator({
    eventSchema: transpileSchema(createAuctionSchema),
  })
);
