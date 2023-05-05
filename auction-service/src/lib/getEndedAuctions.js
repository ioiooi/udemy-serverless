import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getEndedAuctions() {
  const now = new Date();

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status AND endingAt <= :now",
    ExpressionAttributeValues: {
      ":status": "OPEN",
      ":now": now.toISOString(),
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  const command = new QueryCommand(params);

  const result = await docClient.send(command);
  return result.Items;
}
