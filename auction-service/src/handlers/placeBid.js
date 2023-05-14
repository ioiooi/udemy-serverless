import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import placeBidSchema from "../lib/schemas/placeBidSchema";
import commonMiddleware from "../lib/commonMiddleware";
import { getAuctionById } from "./getAuction";
import createError from "http-errors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer.lambda;

  const auction = await getAuctionById(id);

  if (email === auction.seller) {
    throw new createError.Forbidden("You cannot bid on your own auctions!");
  }

  if (email === auction.highestBid.bidder) {
    throw new createError.Forbidden("You are already the highest bidder!");
  }

  if (auction.status !== "OPEN") {
    throw new createError.Forbidden("You cannot bid on closed auctions!");
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );
  }

  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW",
  };

  const command = new UpdateCommand(input);
  let result;

  try {
    result = await docClient.send(command);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Attributes),
  };
}

export const handler = commonMiddleware(placeBid).use(
  validator({
    eventSchema: transpileSchema(placeBidSchema),
  })
);
