import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const id = e.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: "Missing 'id'" };
  }
  const { name } = JSON.parse(e.body || "{}");
  if (!name) {
    return { statusCode: 400, body: "Missing 'name'" };
  }
  await client.send(
    new UpdateItemCommand({
      TableName: TABLE,
      Key: { id: { S: id } },
      UpdateExpression: "SET #n = :n",
      ExpressionAttributeNames: { "#n": "name" },
      ExpressionAttributeValues: { ":n": { S: name } },
    }),
  );
  return { statusCode: 200, body: JSON.stringify({ id, name }) };
};
