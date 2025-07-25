import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE = process.env.SCHEDULES_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const id = e.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: "Missing 'id'" };
  }
  await client.send(
    new DeleteItemCommand({ TableName: TABLE, Key: { id: { S: id } } }),
  );
  return { statusCode: 204, body: "" };
};
