import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const { name } = JSON.parse(e.body || "{}");
  if (!name) {
    return { statusCode: 400, body: "Missing 'name'" };
  }
  const id = uuidv4();
  await client.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: { id: { S: id }, name: { S: name } }
    })
  );
  return { statusCode: 201, body: JSON.stringify({ id, name }) };
};
