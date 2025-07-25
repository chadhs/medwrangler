import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const TABLE = process.env.SCHEDULES_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (e) => {
  const { medId, frequency } = JSON.parse(e.body || "{}");
  if (!medId || !frequency) {
    return { statusCode: 400, body: "Missing 'medId' or 'frequency'" };
  }
  const id = uuidv4();
  await client.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: { id: { S: id }, medId: { S: medId }, frequency: { S: frequency } },
    }),
  );
  return { statusCode: 201, body: JSON.stringify({ id, medId, frequency }) };
};
