import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function getAuctions(event, context) {
  let auctions;

  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
  };

  const command = new ScanCommand(input);

  try {
    const result = await docClient.send(command);
    auctions = result.Items;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions);
