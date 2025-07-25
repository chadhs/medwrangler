import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE = process.env.SCHEDULES_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const id = e.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: "Missing 'id'" };
  }
  const { medId, frequency } = JSON.parse(e.body || "{}");
  if (!medId || !frequency) {
    return { statusCode: 400, body: "Missing 'medId' or 'frequency'" };
  }
  await client.send(
    new UpdateItemCommand({
      TableName: TABLE,
      Key: { id: { S: id } },
      UpdateExpression: "SET medId = :m, frequency = :f",
      ExpressionAttributeValues: {
        ":m": { S: medId },
        ":f": { S: frequency },
      },
    }),
  );
  return { statusCode: 200, body: JSON.stringify({ id, medId, frequency }) };
};
