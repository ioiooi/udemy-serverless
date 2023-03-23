import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function getAuction(event, context) {
  let auction;
  const { id } = event.pathParameters;

  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
  };
  const command = new GetCommand(input);

  try {
    const result = await docClient.send(command);
    auction = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found!`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);
